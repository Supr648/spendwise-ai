import { v4 as uuidv4 } from 'uuid';
import { readDB, saveDB } from '../db/database.js';

export const getTransactions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      search,
      category,
      type,
      startDate,
      endDate,
      accountId,
      limit = 50,
      offset = 0,
      sortBy = 'date',
      sortOrder = 'desc',
    } = req.query;

    const db = readDB();
    let list = db.transactions.filter((t) => t.userId === userId);

    // Filters
    if (type && (type === 'income' || type === 'expense')) {
      list = list.filter((t) => t.type === type);
    }

    if (category && category !== 'ALL') {
      list = list.filter((t) => (t.category || '').toLowerCase() === category.toLowerCase());
    }

    if (accountId) {
      list = list.filter((t) => t.accountId === accountId);
    }

    if (startDate) {
      list = list.filter((t) => t.date >= startDate);
    }

    if (endDate) {
      list = list.filter((t) => t.date <= endDate);
    }

    if (search && search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (t) =>
          (t.notes && t.notes.toLowerCase().includes(q)) ||
          (t.category && t.category.toLowerCase().includes(q)) ||
          (t.paymentMethod && t.paymentMethod.toLowerCase().includes(q)) ||
          String(t.amount).includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      let valA = a[sortBy] || a.date || a.createdAt;
      let valB = b[sortBy] || b.date || b.createdAt;
      if (sortBy === 'amount') {
        return sortOrder === 'asc' ? a.amount - b.amount : b.amount - a.amount;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });

    const totalCount = list.length;
    const paginated = list.slice(parseInt(offset, 10), parseInt(offset, 10) + parseInt(limit, 10));

    res.json({
      success: true,
      totalCount,
      transactions: paginated,
      currency: req.user.currency,
      currencySymbol: req.user.currencySymbol,
    });
  } catch (err) {
    next(err);
  }
};

export const createTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const {
      amount,
      type = 'expense',
      category = 'General',
      date = new Date().toISOString().split('T')[0],
      accountId,
      paymentMethod = 'UPI',
      notes = '',
      checkForDuplicate = true,
    } = req.body || {};

    const numAmount = parseFloat(amount);
    if (!numAmount || isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'A valid positive amount is required.',
      });
    }

    const db = readDB();

    // Duplicate detection: check if same user, type, amount, category, date exists in last 24h
    if (checkForDuplicate) {
      const isDuplicate = db.transactions.some(
        (t) =>
          t.userId === userId &&
          t.type === type &&
          Math.abs(t.amount - numAmount) < 0.01 &&
          t.category?.toLowerCase() === category?.toLowerCase() &&
          t.date === date
      );

      if (isDuplicate && req.body.forceSave !== true) {
        return res.status(409).json({
          success: false,
          isDuplicate: true,
          message: 'Potential duplicate transaction detected with identical date, category, and amount.',
        });
      }
    }

    // Find account to attach or default
    let targetAccountId = accountId;
    if (!targetAccountId) {
      const userAcc = db.accounts.find((a) => a.userId === userId);
      targetAccountId = userAcc ? userAcc.id : 'acc_default';
    }

    const newTx = {
      id: uuidv4(),
      userId,
      accountId: targetAccountId,
      type: type === 'income' ? 'income' : 'expense',
      amount: numAmount,
      category: category.trim(),
      date,
      paymentMethod: paymentMethod.trim(),
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update account balance
    const accIdx = db.accounts.findIndex((a) => a.id === targetAccountId && a.userId === userId);
    if (accIdx !== -1) {
      if (newTx.type === 'income') {
        db.accounts[accIdx].balance = (Number(db.accounts[accIdx].balance) || 0) + numAmount;
      } else {
        db.accounts[accIdx].balance = (Number(db.accounts[accIdx].balance) || 0) - numAmount;
      }
    }

    db.transactions.push(newTx);
    saveDB(db);

    res.status(201).json({
      success: true,
      message: 'Transaction recorded successfully!',
      transaction: newTx,
    });
  } catch (err) {
    next(err);
  }
};

export const updateTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { amount, type, category, date, paymentMethod, notes, accountId } = req.body || {};

    const db = readDB();
    const idx = db.transactions.findIndex((t) => t.id === id && t.userId === userId);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found or access denied.' });
    }

    const oldTx = db.transactions[idx];
    const newAmount = amount !== undefined ? parseFloat(amount) : oldTx.amount;

    if (isNaN(newAmount) || newAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid transaction amount.' });
    }

    // Revert old transaction on account balance and apply new
    const targetAccountId = accountId || oldTx.accountId;
    const accIdx = db.accounts.findIndex((a) => a.id === targetAccountId && a.userId === userId);
    if (accIdx !== -1) {
      // Revert old
      if (oldTx.type === 'income') {
        db.accounts[accIdx].balance -= oldTx.amount;
      } else {
        db.accounts[accIdx].balance += oldTx.amount;
      }
      // Apply new
      const newType = type || oldTx.type;
      if (newType === 'income') {
        db.accounts[accIdx].balance += newAmount;
      } else {
        db.accounts[accIdx].balance -= newAmount;
      }
    }

    const updatedTx = {
      ...oldTx,
      amount: newAmount,
      type: type || oldTx.type,
      category: category !== undefined ? category.trim() : oldTx.category,
      date: date || oldTx.date,
      paymentMethod: paymentMethod !== undefined ? paymentMethod.trim() : oldTx.paymentMethod,
      notes: notes !== undefined ? notes.trim() : oldTx.notes,
      accountId: targetAccountId,
      updatedAt: new Date().toISOString(),
    };

    db.transactions[idx] = updatedTx;
    saveDB(db);

    res.json({
      success: true,
      message: 'Transaction updated successfully!',
      transaction: updatedTx,
    });
  } catch (err) {
    next(err);
  }
};

export const deleteTransaction = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const db = readDB();
    const idx = db.transactions.findIndex((t) => t.id === id && t.userId === userId);

    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Transaction not found or access denied.' });
    }

    const oldTx = db.transactions[idx];
    // Revert account balance
    const accIdx = db.accounts.findIndex((a) => a.id === oldTx.accountId && a.userId === userId);
    if (accIdx !== -1) {
      if (oldTx.type === 'income') {
        db.accounts[accIdx].balance -= oldTx.amount;
      } else {
        db.accounts[accIdx].balance += oldTx.amount;
      }
    }

    db.transactions.splice(idx, 1);
    saveDB(db);

    res.json({
      success: true,
      message: 'Transaction deleted successfully.',
    });
  } catch (err) {
    next(err);
  }
};

export const importTransactionsCSV = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { csvText } = req.body || {};

    if (!csvText || typeof csvText !== 'string') {
      return res.status(400).json({ success: false, message: 'CSV raw string is required in csvText.' });
    }

    const lines = csvText.trim().split(/\r?\n/).filter(Boolean);
    if (lines.length < 2) {
      return res.status(400).json({ success: false, message: 'CSV has no transaction records.' });
    }

    const db = readDB();
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());

    const dateCol = headers.findIndex((h) => h.includes('date'));
    const amountCol = headers.findIndex((h) => h.includes('amount'));
    const typeCol = headers.findIndex((h) => h.includes('type'));
    const categoryCol = headers.findIndex((h) => h.includes('cat'));
    const notesCol = headers.findIndex((h) => h.includes('note') || h.includes('desc'));
    const methodCol = headers.findIndex((h) => h.includes('method') || h.includes('pay'));

    let importedCount = 0;
    let duplicateCount = 0;

    const defaultAcc = db.accounts.find((a) => a.userId === userId);
    const accId = defaultAcc ? defaultAcc.id : 'acc_default';

    for (let i = 1; i < lines.length; i++) {
      const parts = lines[i].split(',').map((p) => p.trim().replace(/^"|"$/g, ''));
      const rawAmount = amountCol !== -1 ? parseFloat(parts[amountCol]) : 0;
      if (!rawAmount || isNaN(rawAmount)) continue;

      const date = dateCol !== -1 ? parts[dateCol] : new Date().toISOString().split('T')[0];
      const type = typeCol !== -1 && parts[typeCol].toLowerCase() === 'income' ? 'income' : 'expense';
      const category = categoryCol !== -1 && parts[categoryCol] ? parts[categoryCol] : 'Imported';
      const notes = notesCol !== -1 && parts[notesCol] ? parts[notesCol] : 'CSV Import';
      const paymentMethod = methodCol !== -1 && parts[methodCol] ? parts[methodCol] : 'Other';

      // Check duplicate
      const isDup = db.transactions.some(
        (t) =>
          t.userId === userId &&
          t.type === type &&
          Math.abs(t.amount - Math.abs(rawAmount)) < 0.01 &&
          t.date === date
      );

      if (isDup) {
        duplicateCount++;
        continue;
      }

      db.transactions.push({
        id: uuidv4(),
        userId,
        accountId: accId,
        type,
        amount: Math.abs(rawAmount),
        category,
        date,
        paymentMethod,
        notes,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
      importedCount++;
    }

    saveDB(db);

    res.json({
      success: true,
      message: `Imported ${importedCount} transactions successfully (${duplicateCount} duplicate records skipped).`,
      importedCount,
      duplicateCount,
    });
  } catch (err) {
    next(err);
  }
};

