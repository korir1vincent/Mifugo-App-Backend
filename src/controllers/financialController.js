// const Expense = require("../models/Expense");
// const Revenue = require("../models/Revenue");

// // @desc    Get all expenses
// // @route   GET /api/financial/expenses
// // @access  Private
// exports.getExpenses = async (req, res) => {
//   try {
//     const { startDate, endDate, category } = req.query;

//     let query = { userId: req.user._id };

//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) query.date.$gte = new Date(startDate);
//       if (endDate) query.date.$lte = new Date(endDate);
//     }

//     if (category) query.category = category;

//     const expenses = await Expense.find(query)
//       .populate("animalId", "name tagId")
//       .sort({ date: -1 });

//     res.status(200).json({
//       success: true,
//       count: expenses.length,
//       expenses,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // @desc    Create expense
// // @route   POST /api/financial/expenses
// // @access  Private
// exports.createExpense = async (req, res) => {
//   try {
//     const expenseData = {
//       ...req.body,
//       userId: req.user._id,
//     };

//     const expense = await Expense.create(expenseData);

//     res.status(201).json({
//       success: true,
//       expense,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // @desc    Update expense
// // @route   PUT /api/financial/expenses/:id
// // @access  Private
// exports.updateExpense = async (req, res) => {
//   try {
//     let expense = await Expense.findOne({
//       _id: req.params.id,
//       userId: req.user._id,
//     });

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
//       new: true,
//       runValidators: true,
//     });

//     res.status(200).json({
//       success: true,
//       expense,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // @desc    Delete expense
// // @route   DELETE /api/financial/expenses/:id
// // @access  Private
// exports.deleteExpense = async (req, res) => {
//   try {
//     const expense = await Expense.findOne({
//       _id: req.params.id,
//       userId: req.user._id,
//     });

//     if (!expense) {
//       return res.status(404).json({
//         success: false,
//         message: "Expense not found",
//       });
//     }

//     await expense.deleteOne();

//     res.status(200).json({
//       success: true,
//       message: "Expense deleted successfully",
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // @desc    Get financial summary
// // @route   GET /api/financial/summary
// // @access  Private
// exports.getSummary = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     let dateQuery = {};
//     if (startDate || endDate) {
//       dateQuery.date = {};
//       if (startDate) dateQuery.date.$gte = new Date(startDate);
//       if (endDate) dateQuery.date.$lte = new Date(endDate);
//     }

//     const expenses = await Expense.find({
//       userId: req.user._id,
//       ...dateQuery,
//     });

//     const revenues = await Revenue.find({
//       userId: req.user._id,
//       ...dateQuery,
//     });

//     const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);
//     const totalRevenue = revenues.reduce((sum, rev) => sum + rev.amount, 0);

//     const expensesByCategory = {};
//     expenses.forEach((exp) => {
//       expensesByCategory[exp.category] =
//         (expensesByCategory[exp.category] || 0) + exp.amount;
//     });

//     res.status(200).json({
//       success: true,
//       summary: {
//         totalExpenses,
//         totalRevenue,
//         netProfit: totalRevenue - totalExpenses,
//         expensesByCategory,
//         transactionCount: {
//           expenses: expenses.length,
//           revenues: revenues.length,
//         },
//       },
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // @desc    Get all revenues
// // @route   GET /api/financial/revenues
// // @access  Private
// exports.getRevenues = async (req, res) => {
//   try {
//     const { startDate, endDate } = req.query;

//     let query = { userId: req.user._id };

//     if (startDate || endDate) {
//       query.date = {};
//       if (startDate) query.date.$gte = new Date(startDate);
//       if (endDate) query.date.$lte = new Date(endDate);
//     }

//     const revenues = await Revenue.find(query)
//       .populate("animalId", "name tagId")
//       .sort({ date: -1 });

//     res.status(200).json({
//       success: true,
//       count: revenues.length,
//       revenues,
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };

// // @desc    Create revenue
// // @route   POST /api/financial/revenues
// // @access  Private
// exports.createRevenue = async (req, res) => {
//   try {
//     const revenueData = {
//       ...req.body,
//       userId: req.user._id,
//     };

//     const revenue = await Revenue.create(revenueData);

//     res.status(201).json({
//       success: true,
//       revenue,
//     });
//   } catch (error) {
//     res.status(400).json({
//       success: false,
//       message: error.message,
//     });
//   }
// };
// const PDFDocument = require("pdfkit");
// const { Resend } = require("resend");
// const User = require("../models/User");

// const resend = new Resend(process.env.RESEND_API_KEY);
// // const PDFDocument = require("pdfkit");
// // const nodemailer = require("nodemailer");
// // const User = require("../models/User");

// // const transporter = nodemailer.createTransport({
// //   host: process.env.EMAIL_HOST,
// //   port: process.env.EMAIL_PORT,
// //   auth: {
// //     user: process.env.EMAIL_USER,
// //     pass: process.env.EMAIL_PASS,
// //   },
// // });

// // @desc    Generate and email financial report
// // @route   POST /api/financial/report
// // @access  Private
// exports.generateReport = async (req, res) => {
//   try {
//     const user = await User.findById(req.user._id);
//     const expenses = await Expense.find({ userId: req.user._id }).sort({
//       date: -1,
//     });
//     const revenues = await Revenue.find({ userId: req.user._id }).sort({
//       date: -1,
//     });

//     const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
//     const totalRevenue = revenues.reduce((sum, r) => sum + r.amount, 0);
//     const netProfit = totalRevenue - totalExpenses;

//     const expensesByCategory = {};
//     expenses.forEach((e) => {
//       expensesByCategory[e.category] =
//         (expensesByCategory[e.category] || 0) + e.amount;
//     });

//     // Generate PDF
//     const doc = new PDFDocument({ margin: 50 });
//     const chunks = [];
//     doc.on("data", (chunk) => chunks.push(chunk));

//     await new Promise((resolve) => {
//       doc.on("end", resolve);

//       // Header
//       doc
//         .fontSize(24)
//         .fillColor("#16a34a")
//         .text("Mifugo Financial Report", { align: "center" });
//       doc.moveDown(0.3);
//       doc
//         .fontSize(12)
//         .fillColor("#6b7280")
//         .text(`Generated: ${new Date().toLocaleDateString()}`, {
//           align: "center",
//         });
//       doc
//         .fontSize(12)
//         .fillColor("#6b7280")
//         .text(`Farm Location: ${user.farmLocation}`, { align: "center" });
//       doc
//         .fontSize(12)
//         .fillColor("#6b7280")
//         .text(`Farmer: ${user.name}`, { align: "center" });
//       doc.moveDown(2);

//       // Summary box
//       doc
//         .fontSize(16)
//         .fillColor("#1f2937")
//         .text("Financial Summary", { underline: true });
//       doc.moveDown(0.5);
//       doc
//         .fontSize(13)
//         .fillColor("#10b981")
//         .text(`Total Revenue:    KES ${totalRevenue.toFixed(2)}`);
//       doc
//         .fontSize(13)
//         .fillColor("#ef4444")
//         .text(`Total Expenses:   KES ${totalExpenses.toFixed(2)}`);
//       doc
//         .fontSize(13)
//         .fillColor(netProfit >= 0 ? "#10b981" : "#ef4444")
//         .text(`Net Profit/Loss:  KES ${netProfit.toFixed(2)}`);
//       doc.moveDown(1.5);

//       // Expense Breakdown
//       doc
//         .fontSize(16)
//         .fillColor("#1f2937")
//         .text("Expense Breakdown by Category", { underline: true });
//       doc.moveDown(0.5);
//       doc.fontSize(12);
//       if (Object.keys(expensesByCategory).length === 0) {
//         doc.fillColor("#6b7280").text("No expenses recorded.");
//       } else {
//         Object.entries(expensesByCategory).forEach(([category, amount]) => {
//           const pct =
//             totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : 0;
//           doc
//             .fillColor("#374151")
//             .text(`  ${category}: KES ${amount.toFixed(2)} (${pct}%)`);
//         });
//       }
//       doc.moveDown(1.5);

//       // Recent Expenses
//       doc
//         .fontSize(16)
//         .fillColor("#1f2937")
//         .text("Recent Expenses (Last 20)", { underline: true });
//       doc.moveDown(0.5);
//       doc.fontSize(10);
//       if (expenses.length === 0) {
//         doc.fillColor("#6b7280").text("No expenses recorded.");
//       } else {
//         expenses.slice(0, 20).forEach((e) => {
//           doc
//             .fillColor("#374151")
//             .text(
//               `${new Date(e.date).toLocaleDateString()}  |  ${e.category}  |  ${e.description}  |  KES ${e.amount.toFixed(2)}`,
//             );
//         });
//       }
//       doc.moveDown(1.5);

//       // Recent Revenues
//       doc
//         .fontSize(16)
//         .fillColor("#1f2937")
//         .text("Recent Revenues (Last 20)", { underline: true });
//       doc.moveDown(0.5);
//       doc.fontSize(10);
//       if (revenues.length === 0) {
//         doc.fillColor("#6b7280").text("No revenues recorded.");
//       } else {
//         revenues.slice(0, 20).forEach((r) => {
//           doc
//             .fillColor("#374151")
//             .text(
//               `${new Date(r.date).toLocaleDateString()}  |  ${r.category}  |  ${r.description}  |  KES ${r.amount.toFixed(2)}`,
//             );
//         });
//       }

//       doc.end();
//     });

//     const pdfBuffer = Buffer.concat(chunks);
//     const filename = `mifugo-report-${Date.now()}.pdf`;

//     // await transporter.sendMail({
//     //   from: `"Mifugo App" <${process.env.EMAIL_USER}>`,
//     //   to: user.email,
//     //   subject: `Your Mifugo Financial Report - ${new Date().toLocaleDateString()}`,
//     //   html: `
//     //     <div style="font-family: Arial, sans-serif; max-width: 500px; margin: auto; padding: 24px; border-radius: 8px; border: 1px solid #e5e7eb;">
//     //       <h2 style="color: #16a34a;">Mifugo Financial Report</h2>
//     //       <p>Hi ${user.name},</p>
//     //       <p>Your financial report has been generated and is attached to this email.</p>
//     //       <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
//     //         <p style="margin: 4px 0;"><strong>Total Revenue:</strong> KES ${totalRevenue.toFixed(2)}</p>
//     //         <p style="margin: 4px 0;"><strong>Total Expenses:</strong> KES ${totalExpenses.toFixed(2)}</p>
//     //         <p style="margin: 4px 0; color: ${netProfit >= 0 ? "#10b981" : "#ef4444"};">
//     //           <strong>Net Profit/Loss:</strong> KES ${netProfit.toFixed(2)}
//     //         </p>
//     //       </div>
//     //       <p style="color: #6b7280; font-size: 13px;">Generated by Mifugo Livestock Management App</p>
//     //     </div>
//     //   `,
//     //   attachments: [
//     //     {
//     //       filename,
//     //       content: pdfBuffer,
//     //       contentType: "application/pdf",
//     //     },
//     //   ],
//     // });

//       await resend.emails.send({
//       from: "Mifugo App <hello@linxvintech.site>",
//       to: user.email,
//       subject: `Your Mifugo Financial Report - ${new Date().toLocaleDateString()}`,
//       html: `
//           <!DOCTYPE html>
//           <html lang="en">
//           <head>
//             <meta charset="UTF-8" />
//             <meta name="viewport" content="width=device-width, initial-scale=1.0" />
//             <title>Mifugo Financial Report</title>
//           </head>

//           <body style="
//             margin: 0;
//             padding: 0;
//             background-color: #f4f7f5;
//             font-family: Arial, Helvetica, sans-serif;
//             color: #111827;
//           ">

//             <div style="
//               width: 100%;
//               background-color: #f4f7f5;
//               padding: 40px 16px;
//               box-sizing: border-box;
//             ">

//               <div style="
//                 max-width: 620px;
//                 margin: 0 auto;
//                 background-color: #ffffff;
//                 border-radius: 20px;
//                 overflow: hidden;
//                 border: 1px solid #e5e7eb;
//                 box-shadow: 0 8px 30px rgba(0,0,0,0.06);
//               ">

//                 <!-- HEADER -->
//                 <div style="
//                   background: linear-gradient(135deg, #166534, #16a34a);
//                   padding: 34px 32px;
//                   color: #ffffff;
//                 ">

//                   <div style="
//                     font-size: 13px;
//                     font-weight: bold;
//                     letter-spacing: 2px;
//                     text-transform: uppercase;
//                     color: #bbf7d0;
//                     margin-bottom: 10px;
//                   ">
//                     MIFUGO
//                   </div>

//                   <div style="
//                     font-size: 30px;
//                     line-height: 1.2;
//                     font-weight: 800;
//                     margin-bottom: 8px;
//                   ">
//                     Financial Report
//                   </div>

//                   <div style="
//                     font-size: 14px;
//                     color: #dcfce7;
//                   ">
//                     Your farm's financial performance at a glance
//                   </div>

//                 </div>

//                 <!-- BODY -->
//                 <div style="padding: 32px;">

//                   <!-- GREETING -->
//                   <div style="margin-bottom: 28px;">

//                     <div style="
//                       font-size: 20px;
//                       font-weight: 700;
//                       color: #111827;
//                       margin-bottom: 8px;
//                     ">
//                       Hello ${user.name || "there"},
//                     </div>

//                     <div style="
//                       font-size: 14px;
//                       line-height: 1.7;
//                       color: #6b7280;
//                     ">
//                       Your latest Mifugo financial report is ready. We've prepared
//                       a summary of your farm's revenue, expenses, and overall
//                       financial performance.
//                     </div>

//                   </div>

//                   <!-- REPORT DATE -->
//                   <div style="
//                     background-color: #f8fafc;
//                     border: 1px solid #e5e7eb;
//                     border-radius: 12px;
//                     padding: 14px 16px;
//                     margin-bottom: 24px;
//                   ">

//                     <div style="
//                       font-size: 11px;
//                       text-transform: uppercase;
//                       letter-spacing: 1px;
//                       color: #9ca3af;
//                       font-weight: bold;
//                       margin-bottom: 4px;
//                     ">
//                       Report Generated
//                     </div>

//                     <div style="
//                       font-size: 14px;
//                       color: #374151;
//                       font-weight: 600;
//                     ">
//                       ${new Date().toLocaleDateString("en-KE", {
//                         day: "numeric",
//                         month: "long",
//                         year: "numeric",
//                       })}
//                     </div>

//                   </div>

//                   <!-- FINANCIAL OVERVIEW -->
//                   <div style="
//                     font-size: 13px;
//                     font-weight: 800;
//                     color: #111827;
//                     text-transform: uppercase;
//                     letter-spacing: 1px;
//                     margin-bottom: 14px;
//                   ">
//                     Financial Overview
//                   </div>

//                   <!-- REVENUE -->
//                   <div style="
//                     border: 1px solid #d1fae5;
//                     background-color: #f0fdf4;
//                     border-radius: 14px;
//                     padding: 18px;
//                     margin-bottom: 10px;
//                   ">

//                     <div style="
//                       font-size: 12px;
//                       color: #6b7280;
//                       margin-bottom: 6px;
//                     ">
//                       Total Revenue
//                     </div>

//                     <div style="
//                       font-size: 24px;
//                       font-weight: 800;
//                       color: #15803d;
//                     ">
//                       KES ${totalRevenue.toLocaleString("en-KE", {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                     </div>

//                     <div style="
//                       font-size: 11px;
//                       color: #16a34a;
//                       margin-top: 5px;
//                     ">
//                       ↑ Total income generated
//                     </div>

//                   </div>

//                   <!-- EXPENSES -->
//                   <div style="
//                     border: 1px solid #fee2e2;
//                     background-color: #fef2f2;
//                     border-radius: 14px;
//                     padding: 18px;
//                     margin-bottom: 10px;
//                   ">

//                     <div style="
//                       font-size: 12px;
//                       color: #6b7280;
//                       margin-bottom: 6px;
//                     ">
//                       Total Expenses
//                     </div>

//                     <div style="
//                       font-size: 24px;
//                       font-weight: 800;
//                       color: #dc2626;
//                     ">
//                       KES ${totalExpenses.toLocaleString("en-KE", {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                     </div>

//                     <div style="
//                       font-size: 11px;
//                       color: #ef4444;
//                       margin-top: 5px;
//                     ">
//                       ↓ Total farm expenditure
//                     </div>

//                   </div>

//                   <!-- PROFIT -->
//                   <div style="
//                     background-color: ${netProfit >= 0 ? "#166534" : "#991b1b"};
//                     border-radius: 16px;
//                     padding: 22px;
//                     margin-top: 14px;
//                     margin-bottom: 28px;
//                   ">

//                     <div style="
//                       color: ${netProfit >= 0 ? "#bbf7d0" : "#fecaca"};
//                       font-size: 11px;
//                       font-weight: 800;
//                       letter-spacing: 1.2px;
//                       text-transform: uppercase;
//                       margin-bottom: 7px;
//                     ">
//                       ${netProfit >= 0 ? "Net Profit" : "Net Loss"}
//                     </div>

//                     <div style="
//                       color: #ffffff;
//                       font-size: 30px;
//                       font-weight: 800;
//                       margin-bottom: 8px;
//                     ">
//                       KES ${Math.abs(netProfit).toLocaleString("en-KE", {
//                         minimumFractionDigits: 2,
//                         maximumFractionDigits: 2,
//                       })}
//                     </div>

//                     <div style="
//                       color: ${netProfit >= 0 ? "#dcfce7" : "#fee2e2"};
//                       font-size: 13px;
//                     ">
//                       ${
//                         netProfit >= 0
//                           ? "Your farm generated more income than expenses during this period."
//                           : "Your farm expenses exceeded the income generated during this period."
//                       }
//                     </div>

//                   </div>

//                   <!-- ATTACHMENT NOTICE -->
//                   <div style="
//                     border: 1px solid #e5e7eb;
//                     border-radius: 14px;
//                     padding: 18px;
//                     background-color: #fafafa;
//                     margin-bottom: 28px;
//                   ">

//                     <div style="
//                       display: block;
//                       font-size: 14px;
//                       font-weight: 700;
//                       color: #374151;
//                       margin-bottom: 6px;
//                     ">
//                       📄 Your detailed report is attached
//                     </div>

//                     <div style="
//                       font-size: 12px;
//                       line-height: 1.6;
//                       color: #6b7280;
//                     ">
//                       Open the attached PDF to view your detailed transactions,
//                       expense breakdown, revenue records, and financial information.
//                     </div>

//                   </div>

//                   <!-- TIP -->
//                   <div style="
//                     border-left: 4px solid #16a34a;
//                     background-color: #f0fdf4;
//                     padding: 15px 16px;
//                     margin-bottom: 28px;
//                   ">

//                     <div style="
//                       font-size: 12px;
//                       font-weight: 800;
//                       color: #166534;
//                       margin-bottom: 4px;
//                     ">
//                       FARM MANAGEMENT TIP
//                     </div>

//                     <div style="
//                       font-size: 12px;
//                       line-height: 1.6;
//                       color: #4b5563;
//                     ">
//                       Keep your expenses and revenue records updated regularly
//                       to get a more accurate picture of your farm's profitability.
//                     </div>

//                   </div>

//                   <!-- CLOSING -->
//                   <div style="
//                     font-size: 14px;
//                     line-height: 1.7;
//                     color: #6b7280;
//                   ">
//                     Thank you for using <strong style="color:#166534;">Mifugo</strong>
//                     to manage your farm.
//                   </div>

//                 </div>

//                 <!-- FOOTER -->
//                 <div style="
//                   background-color: #111827;
//                   padding: 26px 32px;
//                   text-align: center;
//                 ">

//                   <div style="
//                     color: #ffffff;
//                     font-size: 16px;
//                     font-weight: 800;
//                     margin-bottom: 6px;
//                   ">
//                     MIFUGO
//                   </div>

//                   <div style="
//                     color: #9ca3af;
//                     font-size: 11px;
//                     line-height: 1.6;
//                   ">
//                     Livestock & Farm Management
//                     <br />
//                     Smart tools for better farm decisions.
//                   </div>

//                   <div style="
//                     border-top: 1px solid #374151;
//                     margin-top: 18px;
//                     padding-top: 16px;
//                     color: #6b7280;
//                     font-size: 10px;
//                   ">
//                     This is an automated financial report.
//                     Please do not reply directly to this email.
//                   </div>

//                 </div>

//               </div>

//             </div>

//           </body>
//           </html>
//           `,
//       attachments: [
//         {
//           filename,
//           content: pdfBuffer,
//         },
//       ],
//     });

//     res.status(200).json({
//       success: true,
//       message: `Report sent to ${user.email}`,
//     });
//   } catch (error) {
//     console.error("Report generation error:", error);
//     res.status(500).json({ success: false, message: error.message });
//   }
// };


const Expense = require("../models/Expense");
const Revenue = require("../models/Revenue");
const PDFDocument = require("pdfkit");
const { Resend } = require("resend");
const User = require("../models/User");

const resend = new Resend(process.env.RESEND_API_KEY);

/* ============================================================
   HELPERS
============================================================ */

const formatCurrency = (amount) => {
  return `KES ${Number(amount || 0).toLocaleString("en-KE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

const formatDate = (date) => {
  if (!date) return "N/A";

  return new Date(date).toLocaleDateString("en-KE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const safeText = (value) => {
  if (value === undefined || value === null || value === "") {
    return "N/A";
  }

  return String(value);
};

/* ============================================================
   GET ALL EXPENSES
   GET /api/financial/expenses
============================================================ */

exports.getExpenses = async (req, res) => {
  try {
    const { startDate, endDate, category } = req.query;

    const query = {
      userId: req.user._id,
    };

    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    if (category) {
      query.category = category;
    }

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

/* ============================================================
   CREATE EXPENSE
   POST /api/financial/expenses
============================================================ */

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

/* ============================================================
   UPDATE EXPENSE
   PUT /api/financial/expenses/:id
============================================================ */

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

/* ============================================================
   DELETE EXPENSE
   DELETE /api/financial/expenses/:id
============================================================ */

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

/* ============================================================
   GET FINANCIAL SUMMARY
   GET /api/financial/summary
============================================================ */

exports.getSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let dateQuery = {};

    if (startDate || endDate) {
      dateQuery.date = {};

      if (startDate) {
        dateQuery.date.$gte = new Date(startDate);
      }

      if (endDate) {
        dateQuery.date.$lte = new Date(endDate);
      }
    }

    const expenses = await Expense.find({
      userId: req.user._id,
      ...dateQuery,
    });

    const revenues = await Revenue.find({
      userId: req.user._id,
      ...dateQuery,
    });

    const totalExpenses = expenses.reduce(
      (sum, exp) => sum + Number(exp.amount || 0),
      0
    );

    const totalRevenue = revenues.reduce(
      (sum, rev) => sum + Number(rev.amount || 0),
      0
    );

    const expensesByCategory = {};

    expenses.forEach((exp) => {
      expensesByCategory[exp.category] =
        (expensesByCategory[exp.category] || 0) +
        Number(exp.amount || 0);
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

/* ============================================================
   GET ALL REVENUES
   GET /api/financial/revenues
============================================================ */

exports.getRevenues = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = {
      userId: req.user._id,
    };

    if (startDate || endDate) {
      query.date = {};

      if (startDate) {
        query.date.$gte = new Date(startDate);
      }

      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
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

/* ============================================================
   CREATE REVENUE
   POST /api/financial/revenues
============================================================ */

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

/* ============================================================
   GENERATE & EMAIL FINANCIAL PDF REPORT
   POST /api/financial/report
============================================================ */

exports.generateReport = async (req, res) => {
  try {
    /* --------------------------------------------------------
       GET USER
    -------------------------------------------------------- */

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    /* --------------------------------------------------------
       GET FINANCIAL DATA
    -------------------------------------------------------- */

    const expenses = await Expense.find({
      userId: req.user._id,
    }).sort({
      date: -1,
    });

    const revenues = await Revenue.find({
      userId: req.user._id,
    }).sort({
      date: -1,
    });

    /* --------------------------------------------------------
       CALCULATE TOTALS
    -------------------------------------------------------- */

    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.amount || 0),
      0
    );

    const totalRevenue = revenues.reduce(
      (sum, revenue) => sum + Number(revenue.amount || 0),
      0
    );

    const netProfit = totalRevenue - totalExpenses;

    const profitMargin =
      totalRevenue > 0
        ? (netProfit / totalRevenue) * 100
        : 0;

    /* --------------------------------------------------------
       EXPENSE BREAKDOWN
    -------------------------------------------------------- */

    const expensesByCategory = {};

    expenses.forEach((expense) => {
      const category = expense.category || "Other";

      expensesByCategory[category] =
        (expensesByCategory[category] || 0) +
        Number(expense.amount || 0);
    });

    const sortedCategories = Object.entries(
      expensesByCategory
    ).sort((a, b) => b[1] - a[1]);

    /* ========================================================
       CREATE PDF
    ======================================================== */

    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      bufferPages: true,
      info: {
        Title: "Mifugo Financial Report",
        Author: "Mifugo Livestock Management",
        Subject: "Farm Financial Report",
        Creator: "Mifugo App",
      },
    });

    const chunks = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    await new Promise((resolve, reject) => {
      doc.on("end", resolve);
      doc.on("error", reject);

      const PAGE_WIDTH = 595.28;
      const PAGE_HEIGHT = 841.89;

      const GREEN_DARK = "#166534";
      const GREEN = "#16a34a";
      const GREEN_LIGHT = "#dcfce7";

      const RED = "#dc2626";
      const RED_LIGHT = "#fee2e2";

      const BLUE = "#2563eb";
      const BLUE_LIGHT = "#dbeafe";

      const TEXT = "#111827";
      const TEXT_SECONDARY = "#6b7280";
      const BORDER = "#e5e7eb";
      const BACKGROUND = "#f8fafc";
      const WHITE = "#ffffff";

      const MARGIN = 42;
      const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

      /* ======================================================
         PAGE BACKGROUND
      ====================================================== */

      const drawPageBackground = () => {
        doc
          .rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT)
          .fill(BACKGROUND);
      };

      /* ======================================================
         HEADER
      ====================================================== */

      const drawHeader = () => {
        doc
          .rect(0, 0, PAGE_WIDTH, 118)
          .fill(GREEN_DARK);

        // Logo circle
        doc
          .circle(60, 48, 20)
          .fill(WHITE);

        doc
          .fontSize(16)
          .font("Helvetica-Bold")
          .fillColor(GREEN_DARK)
          .text("M", 51, 37, {
            width: 18,
            align: "center",
          });

        // Brand
        doc
          .fontSize(20)
          .font("Helvetica-Bold")
          .fillColor(WHITE)
          .text("MIFUGO", 92, 28);

        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor(GREEN_LIGHT)
          .text(
            "LIVESTOCK & FARM MANAGEMENT",
            93,
            52
          );

        // Report title
        doc
          .fontSize(24)
          .font("Helvetica-Bold")
          .fillColor(WHITE)
          .text("Financial Report", 365, 31, {
            width: 188,
            align: "right",
          });

        doc
          .fontSize(9)
          .font("Helvetica")
          .fillColor(GREEN_LIGHT)
          .text("Farm financial performance", 365, 61, {
            width: 188,
            align: "right",
          });

        // Accent line
        doc
          .rect(42, 102, CONTENT_WIDTH, 3)
          .fill(GREEN);
      };

      /* ======================================================
         FOOTER
      ====================================================== */

      const drawFooter = (pageNumber, totalPages) => {
        doc
          .moveTo(MARGIN, PAGE_HEIGHT - 43)
          .lineTo(PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 43)
          .lineWidth(0.7)
          .strokeColor(BORDER)
          .stroke();

        doc
          .fontSize(8)
          .font("Helvetica")
          .fillColor(TEXT_SECONDARY)
          .text(
            "MIFUGO • Smart tools for better farm decisions",
            MARGIN,
            PAGE_HEIGHT - 30
          );

        doc
          .text(
            `Page ${pageNumber} of ${totalPages}`,
            PAGE_WIDTH - MARGIN - 100,
            PAGE_HEIGHT - 30,
            {
              width: 100,
              align: "right",
            }
          );
      };

      /* ======================================================
         SECTION TITLE
      ====================================================== */

      const sectionTitle = (title, subtitle, y) => {
        doc
          .fontSize(15)
          .font("Helvetica-Bold")
          .fillColor(TEXT)
          .text(title, MARGIN, y);

        if (subtitle) {
          doc
            .fontSize(8.5)
            .font("Helvetica")
            .fillColor(TEXT_SECONDARY)
            .text(subtitle, MARGIN, y + 20);
        }
      };

      /* ======================================================
         SUMMARY CARD
      ====================================================== */

      const summaryCard = (
        x,
        y,
        width,
        label,
        value,
        color,
        lightColor
      ) => {
        doc
          .roundedRect(x, y, width, 82, 10)
          .fillColor(WHITE)
          .fill();

        doc
          .roundedRect(x, y, width, 82, 10)
          .lineWidth(1)
          .strokeColor(BORDER)
          .stroke();

        doc
          .roundedRect(x, y, 5, 82, 3)
          .fill(color);

        doc
          .fontSize(8)
          .font("Helvetica-Bold")
          .fillColor(TEXT_SECONDARY)
          .text(label.toUpperCase(), x + 17, y + 15);

        doc
          .fontSize(15)
          .font("Helvetica-Bold")
          .fillColor(color)
          .text(value, x + 17, y + 35);

        doc
          .circle(x + width - 24, y + 23, 8)
          .fill(lightColor);
      };

      /* ======================================================
         FIRST PAGE
      ====================================================== */

      drawPageBackground();
      drawHeader();

      let y = 145;

      // Farmer information
      doc
        .roundedRect(MARGIN, y, CONTENT_WIDTH, 76, 10)
        .fill(WHITE);

      doc
        .roundedRect(MARGIN, y, CONTENT_WIDTH, 76, 10)
        .lineWidth(1)
        .strokeColor(BORDER)
        .stroke();

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(TEXT_SECONDARY)
        .text("PREPARED FOR", MARGIN + 18, y + 15);

      doc
        .fontSize(15)
        .font("Helvetica-Bold")
        .fillColor(TEXT)
        .text(
          safeText(user.name),
          MARGIN + 18,
          y + 29
        );

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(TEXT_SECONDARY)
        .text(
          `Farm Location: ${safeText(user.farmLocation)}`,
          MARGIN + 18,
          y + 51
        );

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(TEXT_SECONDARY)
        .text("REPORT DATE", 405, y + 15);

      doc
        .fontSize(11)
        .font("Helvetica-Bold")
        .fillColor(TEXT)
        .text(formatDate(new Date()), 405, y + 30);

      y += 102;

      /* ======================================================
         FINANCIAL OVERVIEW
      ====================================================== */

      sectionTitle(
        "Financial Overview",
        "A summary of your farm's financial performance",
        y
      );

      y += 38;

      const cardGap = 10;
      const cardWidth =
        (CONTENT_WIDTH - cardGap * 2) / 3;

      summaryCard(
        MARGIN,
        y,
        cardWidth,
        "Total Revenue",
        formatCurrency(totalRevenue),
        GREEN,
        GREEN_LIGHT
      );

      summaryCard(
        MARGIN + cardWidth + cardGap,
        y,
        cardWidth,
        "Total Expenses",
        formatCurrency(totalExpenses),
        RED,
        RED_LIGHT
      );

      summaryCard(
        MARGIN + (cardWidth + cardGap) * 2,
        y,
        cardWidth,
        netProfit >= 0 ? "Net Profit" : "Net Loss",
        formatCurrency(Math.abs(netProfit)),
        netProfit >= 0 ? GREEN : RED,
        netProfit >= 0 ? GREEN_LIGHT : RED_LIGHT
      );

      y += 106;

      /* ======================================================
         PROFITABILITY CARD
      ====================================================== */

      doc
        .roundedRect(MARGIN, y, CONTENT_WIDTH, 90, 12)
        .fill(netProfit >= 0 ? GREEN_DARK : "#991b1b");

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(
          netProfit >= 0 ? GREEN_LIGHT : RED_LIGHT
        )
        .text(
          netProfit >= 0
            ? "PROFITABILITY STATUS"
            : "PROFITABILITY STATUS",
          MARGIN + 20,
          y + 17
        );

      doc
        .fontSize(17)
        .font("Helvetica-Bold")
        .fillColor(WHITE)
        .text(
          netProfit >= 0
            ? "Your farm is currently profitable"
            : "Your farm is currently operating at a loss",
          MARGIN + 20,
          y + 34
        );

      doc
        .fontSize(9)
        .font("Helvetica")
        .fillColor(
          netProfit >= 0 ? GREEN_LIGHT : RED_LIGHT
        )
        .text(
          `Profit margin: ${profitMargin.toFixed(1)}%`,
          MARGIN + 20,
          y + 61
        );

      y += 116;

      /* ======================================================
         EXPENSE BREAKDOWN
      ====================================================== */

      sectionTitle(
        "Expense Breakdown",
        "How your farm expenses are distributed",
        y
      );

      y += 38;

      if (sortedCategories.length === 0) {
        doc
          .roundedRect(MARGIN, y, CONTENT_WIDTH, 60, 10)
          .fill(WHITE)
          .strokeColor(BORDER)
          .stroke();

        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor(TEXT_SECONDARY)
          .text(
            "No expenses have been recorded.",
            MARGIN + 18,
            y + 23
          );
      } else {
        sortedCategories
          .slice(0, 7)
          .forEach(([category, amount], index) => {
            const percentage =
              totalExpenses > 0
                ? (amount / totalExpenses) * 100
                : 0;

            const rowY = y + index * 32;

            doc
              .fontSize(9)
              .font("Helvetica-Bold")
              .fillColor(TEXT)
              .text(category, MARGIN, rowY);

            doc
              .fontSize(8)
              .font("Helvetica")
              .fillColor(TEXT_SECONDARY)
              .text(
                `${percentage.toFixed(1)}%`,
                MARGIN + 100,
                rowY
              );

            const barX = MARGIN + 145;
            const barWidth = 235;

            doc
              .roundedRect(
                barX,
                rowY + 2,
                barWidth,
                8,
                4
              )
              .fill("#e5e7eb");

            doc
              .roundedRect(
                barX,
                rowY + 2,
                Math.max(
                  4,
                  barWidth * (percentage / 100)
                ),
                8,
                4
              )
              .fill(GREEN);

            doc
              .fontSize(8.5)
              .font("Helvetica-Bold")
              .fillColor(TEXT)
              .text(
                formatCurrency(amount),
                barX + barWidth + 10,
                rowY
              );
          });
      }

      y += Math.min(sortedCategories.length, 7) * 32 + 40;

      /* ======================================================
         TRANSACTION STATISTICS
      ====================================================== */

      sectionTitle(
        "Transaction Activity",
        "Recorded financial activity",
        y
      );

      y += 35;

      const statWidth =
        (CONTENT_WIDTH - 10) / 2;

      // Expenses
      doc
        .roundedRect(
          MARGIN,
          y,
          statWidth,
          65,
          10
        )
        .fill(WHITE)
        .strokeColor(BORDER)
        .stroke();

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(TEXT_SECONDARY)
        .text(
          "EXPENSE TRANSACTIONS",
          MARGIN + 16,
          y + 14
        );

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(RED)
        .text(
          expenses.length.toString(),
          MARGIN + 16,
          y + 29
        );

      // Revenues
      doc
        .roundedRect(
          MARGIN + statWidth + 10,
          y,
          statWidth,
          65,
          10
        )
        .fill(WHITE)
        .strokeColor(BORDER)
        .stroke();

      doc
        .fontSize(8)
        .font("Helvetica-Bold")
        .fillColor(TEXT_SECONDARY)
        .text(
          "REVENUE TRANSACTIONS",
          MARGIN + statWidth + 26,
          y + 14
        );

      doc
        .fontSize(20)
        .font("Helvetica-Bold")
        .fillColor(GREEN)
        .text(
          revenues.length.toString(),
          MARGIN + statWidth + 26,
          y + 29
        );

      /* ======================================================
         SECOND PAGE
      ====================================================== */

      doc.addPage();

      drawPageBackground();
      drawHeader();

      y = 145;

      sectionTitle(
        "Expense Transactions",
        "Detailed record of your farm expenditure",
        y
      );

      y += 42;

      const tableX = MARGIN;
      const tableWidth = CONTENT_WIDTH;

      const dateWidth = 70;
      const categoryWidth = 90;
      const descriptionWidth = 205;
      const amountWidth =
        tableWidth -
        dateWidth -
        categoryWidth -
        descriptionWidth;

      const drawExpenseTableHeader = (headerY) => {
        doc
          .roundedRect(
            tableX,
            headerY,
            tableWidth,
            27,
            6
          )
          .fill(GREEN_DARK);

        doc
          .fontSize(7)
          .font("Helvetica-Bold")
          .fillColor(WHITE)
          .text("DATE", tableX + 8, headerY + 9);

        doc.text(
          "CATEGORY",
          tableX + dateWidth + 8,
          headerY + 9
        );

        doc.text(
          "DESCRIPTION",
          tableX +
            dateWidth +
            categoryWidth +
            8,
          headerY + 9
        );

        doc.text(
          "AMOUNT",
          tableX +
            dateWidth +
            categoryWidth +
            descriptionWidth +
            8,
          headerY + 9
        );
      };

      drawExpenseTableHeader(y);

      y += 27;

      if (expenses.length === 0) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor(TEXT_SECONDARY)
          .text(
            "No expense transactions recorded.",
            tableX + 10,
            y + 20
          );
      } else {
        expenses.forEach((expense, index) => {
          const rowHeight = 32;

          if (y + rowHeight > PAGE_HEIGHT - 65) {
            doc.addPage();
            drawPageBackground();
            drawHeader();

            y = 145;

            drawExpenseTableHeader(y);

            y += 27;
          }

          if (index % 2 === 0) {
            doc
              .rect(
                tableX,
                y,
                tableWidth,
                rowHeight
              )
              .fill("#f8fafc");
          }

          doc
            .fontSize(7.5)
            .font("Helvetica")
            .fillColor(TEXT)
            .text(
              formatDate(expense.date),
              tableX + 8,
              y + 10,
              {
                width: dateWidth - 12,
              }
            );

          doc
            .font("Helvetica-Bold")
            .fillColor(TEXT)
            .text(
              safeText(expense.category),
              tableX + dateWidth + 8,
              y + 10,
              {
                width: categoryWidth - 12,
              }
            );

          doc
            .font("Helvetica")
            .fillColor(TEXT_SECONDARY)
            .text(
              safeText(expense.description),
              tableX +
                dateWidth +
                categoryWidth +
                8,
              y + 10,
              {
                width: descriptionWidth - 12,
                ellipsis: true,
              }
            );

          doc
            .font("Helvetica-Bold")
            .fillColor(RED)
            .text(
              formatCurrency(expense.amount),
              tableX +
                dateWidth +
                categoryWidth +
                descriptionWidth +
                8,
              y + 10,
              {
                width: amountWidth - 12,
              }
            );

          y += rowHeight;
        });
      }

      /* ======================================================
         REVENUE SECTION
      ====================================================== */

      y += 35;

      if (y > PAGE_HEIGHT - 180) {
        doc.addPage();
        drawPageBackground();
        drawHeader();

        y = 145;
      }

      sectionTitle(
        "Revenue Transactions",
        "Detailed record of your farm income",
        y
      );

      y += 42;

      const drawRevenueTableHeader = (headerY) => {
        doc
          .roundedRect(
            tableX,
            headerY,
            tableWidth,
            27,
            6
          )
          .fill(GREEN_DARK);

        doc
          .fontSize(7)
          .font("Helvetica-Bold")
          .fillColor(WHITE)
          .text("DATE", tableX + 8, headerY + 9);

        doc.text(
          "CATEGORY",
          tableX + dateWidth + 8,
          headerY + 9
        );

        doc.text(
          "DESCRIPTION",
          tableX +
            dateWidth +
            categoryWidth +
            8,
          headerY + 9
        );

        doc.text(
          "AMOUNT",
          tableX +
            dateWidth +
            categoryWidth +
            descriptionWidth +
            8,
          headerY + 9
        );
      };

      drawRevenueTableHeader(y);

      y += 27;

      if (revenues.length === 0) {
        doc
          .fontSize(10)
          .font("Helvetica")
          .fillColor(TEXT_SECONDARY)
          .text(
            "No revenue transactions recorded.",
            tableX + 10,
            y + 20
          );
      } else {
        revenues.forEach((revenue, index) => {
          const rowHeight = 32;

          if (y + rowHeight > PAGE_HEIGHT - 65) {
            doc.addPage();
            drawPageBackground();
            drawHeader();

            y = 145;

            drawRevenueTableHeader(y);

            y += 27;
          }

          if (index % 2 === 0) {
            doc
              .rect(
                tableX,
                y,
                tableWidth,
                rowHeight
              )
              .fill("#f8fafc");
          }

          doc
            .fontSize(7.5)
            .font("Helvetica")
            .fillColor(TEXT)
            .text(
              formatDate(revenue.date),
              tableX + 8,
              y + 10,
              {
                width: dateWidth - 12,
              }
            );

          doc
            .font("Helvetica-Bold")
            .fillColor(TEXT)
            .text(
              safeText(revenue.category),
              tableX + dateWidth + 8,
              y + 10,
              {
                width: categoryWidth - 12,
              }
            );

          doc
            .font("Helvetica")
            .fillColor(TEXT_SECONDARY)
            .text(
              safeText(revenue.description),
              tableX +
                dateWidth +
                categoryWidth +
                8,
              y + 10,
              {
                width: descriptionWidth - 12,
                ellipsis: true,
              }
            );

          doc
            .font("Helvetica-Bold")
            .fillColor(GREEN)
            .text(
              formatCurrency(revenue.amount),
              tableX +
                dateWidth +
                categoryWidth +
                descriptionWidth +
                8,
              y + 10,
              {
                width: amountWidth - 12,
              }
            );

          y += rowHeight;
        });
      }

      /* ======================================================
         FINAL SUMMARY
      ====================================================== */

      if (y + 150 > PAGE_HEIGHT - 65) {
        doc.addPage();
        drawPageBackground();
        drawHeader();

        y = 145;
      } else {
        y += 40;
      }

      sectionTitle(
        "Report Summary",
        "Final financial position",
        y
      );

      y += 38;

      doc
        .roundedRect(
          MARGIN,
          y,
          CONTENT_WIDTH,
          105,
          12
        )
        .fill(WHITE)
        .strokeColor(BORDER)
        .stroke();

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(TEXT_SECONDARY)
        .text(
          "TOTAL REVENUE",
          MARGIN + 18,
          y + 17
        );

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(GREEN)
        .text(
          formatCurrency(totalRevenue),
          MARGIN + 18,
          y + 34
        );

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(TEXT_SECONDARY)
        .text(
          "TOTAL EXPENSES",
          MARGIN + 210,
          y + 17
        );

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(RED)
        .text(
          formatCurrency(totalExpenses),
          MARGIN + 210,
          y + 34
        );

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(TEXT_SECONDARY)
        .text(
          netProfit >= 0 ? "NET PROFIT" : "NET LOSS",
          MARGIN + 390,
          y + 17
        );

      doc
        .fontSize(13)
        .font("Helvetica-Bold")
        .fillColor(
          netProfit >= 0 ? GREEN : RED
        )
        .text(
          formatCurrency(Math.abs(netProfit)),
          MARGIN + 390,
          y + 34
        );

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(TEXT_SECONDARY)
        .text(
          `Profit margin: ${profitMargin.toFixed(1)}%`,
          MARGIN + 18,
          y + 76
        );

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(TEXT_SECONDARY)
        .text(
          `Total transactions: ${
            expenses.length + revenues.length
          }`,
          MARGIN + 210,
          y + 76
        );

      /* ======================================================
         FINAL NOTE
      ====================================================== */

      y += 130;

      doc
        .roundedRect(
          MARGIN,
          y,
          CONTENT_WIDTH,
          62,
          10
        )
        .fill("#f0fdf4");

      doc
        .rect(MARGIN, y, 4, 62)
        .fill(GREEN);

      doc
        .fontSize(9)
        .font("Helvetica-Bold")
        .fillColor(GREEN_DARK)
        .text(
          "MIFUGO FARM MANAGEMENT",
          MARGIN + 17,
          y + 14
        );

      doc
        .fontSize(8)
        .font("Helvetica")
        .fillColor(TEXT_SECONDARY)
        .text(
          "Keep your financial records updated regularly to make better",
          MARGIN + 17,
          y + 31
        );

      doc.text(
        "decisions and understand your farm's financial performance.",
        MARGIN + 17,
        y + 43
      );

      /* ======================================================
         ADD FOOTERS TO ALL PAGES
      ====================================================== */

      const range = doc.bufferedPageRange();
      const totalPages = range.count;

      for (
        let pageIndex = 0;
        pageIndex < totalPages;
        pageIndex++
      ) {
        doc.switchToPage(range.start + pageIndex);

        drawFooter(
          pageIndex + 1,
          totalPages
        );
      }

      doc.end();
    });

    /* ========================================================
       PDF BUFFER
    ======================================================== */

    const pdfBuffer = Buffer.concat(chunks);

    const filename = `mifugo-financial-report-${Date.now()}.pdf`;

    /* ========================================================
       EMAIL
    ======================================================== */

    const reportDate = new Date().toLocaleDateString(
      "en-KE",
      {
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );

    const formattedRevenue = totalRevenue.toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

    const formattedExpenses = totalExpenses.toLocaleString(
      "en-KE",
      {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }
    );

    const formattedProfit = Math.abs(
      netProfit
    ).toLocaleString("en-KE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

    await resend.emails.send({
      from: "Mifugo App <hello@linxvintech.site>",
      to: user.email,
      subject: `Your Mifugo Financial Report — ${reportDate}`,

      html: `
<!DOCTYPE html>
<html lang="en">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Mifugo Financial Report</title>
</head>

<body style="
margin:0;
padding:0;
background:#f4f7f5;
font-family:Arial,Helvetica,sans-serif;
color:#111827;
">

<div style="
padding:40px 16px;
">

<div style="
max-width:620px;
margin:auto;
background:#ffffff;
border-radius:20px;
overflow:hidden;
border:1px solid #e5e7eb;
">

<!-- HEADER -->

<div style="
background:#166534;
padding:34px 32px;
">

<div style="
font-size:13px;
font-weight:bold;
letter-spacing:2px;
color:#bbf7d0;
margin-bottom:8px;
">
MIFUGO
</div>

<div style="
font-size:30px;
font-weight:800;
color:#ffffff;
margin-bottom:8px;
">
Financial Report
</div>

<div style="
font-size:14px;
color:#dcfce7;
">
Your farm's financial performance at a glance
</div>

</div>

<!-- BODY -->

<div style="padding:32px;">

<div style="
font-size:20px;
font-weight:700;
margin-bottom:8px;
">
Hello ${safeText(user.name)},
</div>

<div style="
font-size:14px;
line-height:1.7;
color:#6b7280;
margin-bottom:24px;
">
Your Mifugo financial report has been generated successfully.
The detailed PDF report is attached to this email.
</div>

<div style="
background:#f8fafc;
border:1px solid #e5e7eb;
border-radius:12px;
padding:15px;
margin-bottom:24px;
">

<div style="
font-size:11px;
color:#9ca3af;
font-weight:bold;
letter-spacing:1px;
margin-bottom:5px;
">
REPORT GENERATED
</div>

<div style="
font-size:14px;
font-weight:600;
color:#374151;
">
${reportDate}
</div>

</div>

<div style="
font-size:13px;
font-weight:800;
letter-spacing:1px;
margin-bottom:14px;
">
FINANCIAL OVERVIEW
</div>

<!-- REVENUE -->

<div style="
background:#f0fdf4;
border:1px solid #d1fae5;
border-radius:14px;
padding:18px;
margin-bottom:10px;
">

<div style="
font-size:12px;
color:#6b7280;
margin-bottom:5px;
">
TOTAL REVENUE
</div>

<div style="
font-size:24px;
font-weight:800;
color:#15803d;
">
KES ${formattedRevenue}
</div>

</div>

<!-- EXPENSES -->

<div style="
background:#fef2f2;
border:1px solid #fee2e2;
border-radius:14px;
padding:18px;
margin-bottom:10px;
">

<div style="
font-size:12px;
color:#6b7280;
margin-bottom:5px;
">
TOTAL EXPENSES
</div>

<div style="
font-size:24px;
font-weight:800;
color:#dc2626;
">
KES ${formattedExpenses}
</div>

</div>

<!-- PROFIT -->

<div style="
background:${netProfit >= 0 ? "#166534" : "#991b1b"};
border-radius:16px;
padding:22px;
margin-top:14px;
margin-bottom:24px;
">

<div style="
font-size:11px;
font-weight:800;
letter-spacing:1px;
color:${netProfit >= 0 ? "#bbf7d0" : "#fecaca"};
margin-bottom:7px;
">
${netProfit >= 0 ? "NET PROFIT" : "NET LOSS"}
</div>

<div style="
font-size:30px;
font-weight:800;
color:#ffffff;
margin-bottom:7px;
">
KES ${formattedProfit}
</div>

<div style="
font-size:13px;
color:${netProfit >= 0 ? "#dcfce7" : "#fee2e2"};
">
${
  netProfit >= 0
    ? "Your farm generated more income than expenses."
    : "Your farm expenses exceeded the income generated."
}
</div>

</div>

<!-- ATTACHMENT -->

<div style="
border:1px solid #e5e7eb;
border-radius:14px;
padding:18px;
background:#fafafa;
margin-bottom:24px;
">

<div style="
font-size:14px;
font-weight:700;
color:#374151;
margin-bottom:6px;
">
📄 Detailed PDF report attached
</div>

<div style="
font-size:12px;
line-height:1.6;
color:#6b7280;
">
Your attached PDF contains your financial overview,
expense breakdown, revenue records, transaction history,
and final financial position.
</div>

</div>

<!-- TIP -->

<div style="
border-left:4px solid #16a34a;
background:#f0fdf4;
padding:15px 16px;
margin-bottom:24px;
">

<div style="
font-size:12px;
font-weight:800;
color:#166534;
margin-bottom:4px;
">
FARM MANAGEMENT TIP
</div>

<div style="
font-size:12px;
line-height:1.6;
color:#4b5563;
">
Keep your expense and revenue records updated regularly
to get a clearer picture of your farm's profitability.
</div>

</div>

<div style="
font-size:14px;
line-height:1.7;
color:#6b7280;
">
Thank you for using
<strong style="color:#166534;">
Mifugo
</strong>
to manage your farm.
</div>

</div>

<!-- FOOTER -->

<div style="
background:#111827;
padding:26px 32px;
text-align:center;
">

<div style="
color:#ffffff;
font-size:16px;
font-weight:800;
margin-bottom:6px;
">
MIFUGO
</div>

<div style="
color:#9ca3af;
font-size:11px;
line-height:1.6;
">
Livestock & Farm Management
<br>
Smart tools for better farm decisions.
</div>

<div style="
border-top:1px solid #374151;
margin-top:18px;
padding-top:16px;
color:#6b7280;
font-size:10px;
">
This is an automated financial report.
</div>

</div>

</div>

</div>

</body>
</html>
`,

      attachments: [
        {
          filename,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    /* ========================================================
       SUCCESS
    ======================================================== */

    res.status(200).json({
      success: true,
      message: `Report sent to ${user.email}. Check your inbox/spam for the attached PDF.`,
    });
  } catch (error) {
    console.error("Report generation error:", error);

    res.status(500).json({
      success: false,
      message:
        error.message ||
        "Failed to generate financial report",
    });
  }
};