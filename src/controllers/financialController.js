const Expense = require("../models/Expense");
const Revenue = require("../models/Revenue");

// @desc    Get all expenses
// @route   GET /api/financial/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    let query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    if (category) query.category = category;

    const expenses = await Expense.find(query)
      .populate("animalId", "name tagId")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: expenses.length,
      expenses,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create expense
// @route   POST /api/financial/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const expenseData = {
      ...req.body,
      userId: req.user._id,
    };

    const expense = await Expense.create(expenseData);

    res.status(201).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Update expense
// @route   PUT /api/financial/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      expense,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Delete expense
// @route   DELETE /api/financial/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    await expense.deleteOne();

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get financial summary
// @route   GET /api/financial/summary
// @access  Private
exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};
    if (startDate || endDate) {
      dateQuery.date = {};
      if (startDate) dateQuery.date.$gte = new Date(startDate);
      if (endDate) dateQuery.date.$lte = new Date(endDate);
    }

    const expenses = await Expense.find({
      userId: req.user._id,
      ...dateQuery,
    });

    const revenues = await Revenue.find({
      userId: req.user._id,
      ...dateQuery,
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);

    const expensesByCategory = {};
    expenses.forEach((exp) => {
      expensesByCategory[exp.category] =
        (expensesByCategory[exp.category] || 0) + exp.amount;
    });

    res.status(200).json({
      success: true,
      summary: {
        totalExpenses,
        totalRevenue,
        netProfit: totalRevenue - totalExpenses,
        expensesByCategory,
        transactionCount: {
          expenses: expenses.length,
          revenues: revenues.length,
        },
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Get all revenues
// @route   GET /api/financial/revenues
// @access  Private
exports.getRevenues = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = { userId: req.user._id };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = new Date(startDate);
      if (endDate) query.date.$lte = new Date(endDate);
    }

    const revenues = await Revenue.find(query)
      .populate("animalId", "name tagId")
      .sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: revenues.length,
      revenues,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// @desc    Create revenue
// @route   POST /api/financial/revenues
// @access  Private
exports.createRevenue = async (req, res) => {
  try {
    const revenueData = {
      ...req.body,
      userId: req.user._id,
    };

    const revenue = await Revenue.create(revenueData);

    res.status(201).json({
      success: true,
      revenue,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
const PDFDocument = require("pdfkit");
const { Resend } = require("resend");
const User = require("../models/User");

const resend = new Resend(process.env.RESEND_API_KEY);
// const PDFDocument = require("pdfkit");
// const nodemailer = require("nodemailer");
// const User = require("../models/User");

// const transporter = nodemailer.createTransport({
//   host: process.env.EMAIL_HOST,
//   port: process.env.EMAIL_PORT,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// @desc    Generate and email financial report
// @route   POST /api/financial/report
// @access  Private
exports.generateReport = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const expenses = await Expense.find({ userId: req.user._id }).sort({
      date: -1,
    });
    const revenues = await Revenue.find({ userId: req.user._id }).sort({
      date: -1,
    });

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
    const netProfit = totalRevenue - totalExpenses;

    const expensesByCategory = {};
    expenses.forEach((e) => {
      expensesByCategory[e.category] =
        (expensesByCategory[e.category] || 0) + e.amount;
    });

    // Generate PDF
    const doc = new PDFDocument({ margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));

    await new Promise((resolve) => {
      doc.on("end", resolve);

      // Header
      doc
        .fontSize(24)
        .fillColor("#16a34a")
        .text("Mifugo Financial Report", { align: "center" });
      doc.moveDown(0.3);
      doc
        .fontSize(12)
        .fillColor("#6b7280")
        .text(`Generated: ${new Date().toLocaleDateString()}`, {
          align: "center",
        });
      doc
        .fontSize(12)
        .fillColor("#6b7280")
        .text(`Farm Location: ${user.farmLocation}`, { align: "center" });
      doc
        .fontSize(12)
        .fillColor("#6b7280")
        .text(`Farmer: ${user.name}`, { align: "center" });
      doc.moveDown(2);

      // Summary box
      doc
        .fontSize(16)
        .fillColor("#1f2937")
        .text("Financial Summary", { underline: true });
      doc.moveDown(0.5);
      doc
        .fontSize(13)
        .fillColor("#10b981")
        .text(`Total Revenue:    KES ${totalRevenue.toFixed(2)}`);
      doc
        .fontSize(13)
        .fillColor("#ef4444")
        .text(`Total Expenses:   KES ${totalExpenses.toFixed(2)}`);
      doc
        .fontSize(13)
        .fillColor(netProfit >= 0 ? "#10b981" : "#ef4444")
        .text(`Net Profit/Loss:  KES ${netProfit.toFixed(2)}`);
      doc.moveDown(1.5);

      // Expense Breakdown
      doc
        .fontSize(16)
        .fillColor("#1f2937")
        .text("Expense Breakdown by Category", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(12);
      if (Object.keys(expensesByCategory).length === 0) {
        doc.fillColor("#6b7280").text("No expenses recorded.");
      } else {
        Object.entries(expensesByCategory).forEach(([category, amount]) => {
          const pct =
            totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
          doc
            .fillColor("#374151")
            .text(`  ${category}: KES ${amount.toFixed(2)} (${pct}%)`);
        });
      }
      doc.moveDown(1.5);

      // Recent Expenses
      doc
        .fontSize(16)
        .fillColor("#1f2937")
        .text("Recent Expenses (Last 20)", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      if (expenses.length === 0) {
        doc.fillColor("#6b7280").text("No expenses recorded.");
      } else {
        expenses.slice(0, 20).forEach((e) => {
          doc
            .fillColor("#374151")
            .text(
              `${new Date(e.date).toLocaleDateString()}  |  ${e.category}  |  ${e.description}  |  KES ${e.amount.toFixed(2)}`,
            );
        });
      }
      doc.moveDown(1.5);

      // Recent Revenues
      doc
        .fontSize(16)
        .fillColor("#1f2937")
        .text("Recent Revenues (Last 20)", { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);
      if (revenues.length === 0) {
        doc.fillColor("#6b7280").text("No revenues recorded.");
      } else {
        revenues.slice(0, 20).forEach((r) => {
          doc
            .fillColor("#374151")
            .text(
              `${new Date(r.date).toLocaleDateString()}  |  ${r.category}  |  ${r.description}  |  KES ${r.amount.toFixed(2)}`,
            );
        });
      }

      doc.end();
    });

    const pdfBuffer = Buffer.concat(chunks);
    const filename = `mifugo-report-${Date.now()}.pdf`;

    // await transporter.sendMail({
    //   from: `"Mifugo App" <${process.env.EMAIL_USER}>`,
    //   to: user.email,
    //   subject: `Your Mifugo Financial Report - ${new Date().toLocaleDateString()}`,
    //   html: `
    //     <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
    //       <h2 style="color: #16a34a;">Mifugo Financial Report</h2>
    //       <p>Hi ${user.name},</p>
    //       <p>Your financial report has been generated and is attached to this email.</p>
    //       <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
    //         <p style="margin: 4px 0;"><strong>Total Revenue:</strong> KES ${totalRevenue.toFixed(2)}</p>
    //         <p style="margin: 4px 0;"><strong>Total Expenses:</strong> KES ${totalExpenses.toFixed(2)}</p>
    //         <p style="margin: 4px 0; color: ${netProfit >= 0 ? "#10b981" : "#ef4444"};">
    //           <strong>Net Profit/Loss:</strong> KES ${netProfit.toFixed(2)}
    //         </p>
    //       </div>
    //       <p style="color: #6b7280; font-size: 13px;">Generated by Mifugo Livestock Management App</p>
    //     </div>
    //   `,
    //   attachments: [
    //     {
    //       filename,
    //       content: pdfBuffer,
    //       contentType: "application/pdf",
    //     },
    //   ],
    // });

        await resend.emails.send({
      from: "Mifugo App <hello@linxvintech.site>",
      to: user.email,
      subject: `Your Mifugo Financial Report - ${new Date().toLocaleDateString()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
          <h2 style="color: #16a34a;">Mifugo Financial Report</h2>
          <p>Hi ${user.name},</p>
          <p>Your financial report has been generated and is attached to this email.</p>
          <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
            <p style="margin: 4px 0;"><strong>Total Revenue:</strong> KES ${totalRevenue.toFixed(2)}</p>
            <p style="margin: 4px 0;"><strong>Total Expenses:</strong> KES ${totalExpenses.toFixed(2)}</p>
            <p style="margin: 4px 0; color: ${netProfit >= 0 ? "#10b981" : "#ef4444"};">
              <strong>Net Profit/Loss:</strong> KES ${netProfit.toFixed(2)}
            </p>
          </div>
          <p style="color: #6b7280; font-size: 13px;">Generated by Mifugo Livestock Management App</p>
        </div>
      `,
      attachments: [
        {
          filename,
          content: pdfBuffer,
        },
      ],
    });

    res.status(200).json({
      success: true,
      message: `Report sent to ${user.email}`,
    });
  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
