// prisma/seed.ts
import { PrismaClient, Role, Gender, LoanType, InstallmentType, LoanStatus, PaymentStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { addDays, addWeeks, addMonths } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data
  await prisma.payment.deleteMany();
  await prisma.loanInstallment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.party.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.user.deleteMany();
  await prisma.systemSettings.deleteMany();

  // ─── USERS ───────────────────────────────────────────────────────────────
  const hashedPassword = await bcrypt.hash('123456', 12);

  const admin = await prisma.user.create({
    data: {
      name: 'Super Admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: Role.ADMIN,
      phone: '9800000001',
      isActive: true,
    },
  });

  const subAdmin = await prisma.user.create({
    data: {
      name: 'Rajan Sharma',
      email: 'subadmin@example.com',
      password: hashedPassword,
      role: Role.SUB_ADMIN,
      phone: '9800000002',
      isActive: true,
    },
  });

  const agent1 = await prisma.user.create({
    data: {
      name: 'Vikram Singh',
      email: 'agent1@example.com',
      password: hashedPassword,
      role: Role.AGENT,
      phone: '9811111111',
      agentCode: 'AGT001',
      isActive: true,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      name: 'Priya Patel',
      email: 'agent2@example.com',
      password: hashedPassword,
      role: Role.AGENT,
      phone: '9822222222',
      agentCode: 'AGT002',
      isActive: true,
    },
  });

  const agent3 = await prisma.user.create({
    data: {
      name: 'Suresh Kumar',
      email: 'agent3@example.com',
      password: hashedPassword,
      role: Role.AGENT,
      phone: '9833333333',
      agentCode: 'AGT003',
      isActive: true,
    },
  });

  console.log('✅ Users created');

  // ─── SYSTEM SETTINGS ─────────────────────────────────────────────────────
  await prisma.systemSettings.createMany({
    data: [
      { key: 'company_name', value: 'MicroFinance Pro' },
      { key: 'company_address', value: '123 Finance Street, Mumbai, Maharashtra 400001' },
      { key: 'company_phone', value: '1800-123-4567' },
      { key: 'company_email', value: 'info@microfinancepro.com' },
      { key: 'currency', value: '₹' },
      { key: 'smtp_host', value: 'smtp.gmail.com' },
      { key: 'smtp_port', value: '587' },
    ],
  });

  // ─── PARTIES ─────────────────────────────────────────────────────────────
  const parties = await Promise.all([
    prisma.party.create({
      data: {
        partyCode: 'PC001',
        customerId: 'CUST0001',
        name: 'Ramesh Verma',
        fatherName: 'Suresh Verma',
        mobile1: '9701234567',
        mobile2: '9701234568',
        email: 'ramesh.verma@gmail.com',
        gender: Gender.MALE,
        birthdate: new Date('1985-06-15'),
        area: 'Sector 12',
        city: 'Noida',
        state: 'Uttar Pradesh',
        pincode: '201301',
        pan: 'ABCDE1234F',
        aadhaar: '1234-5678-9012',
        occupation: 'Small Business Owner',
        loanLimit: 500000,
        balance: 0,
        agentId: agent1.id,
        bankName: 'State Bank of India',
        bankIfsc: 'SBIN0001234',
        bankAccountNo: '10123456789',
        bankAccountHolder: 'Ramesh Verma',
        guarantor1Name: 'Mohan Verma',
        guarantor1Mobile: '9701234569',
        guarantor1Relation: 'Brother',
        guarantor1Address: 'Sector 12, Noida',
      },
    }),
    prisma.party.create({
      data: {
        partyCode: 'PC002',
        customerId: 'CUST0002',
        name: 'Sunita Devi',
        fatherName: 'Rajendra Prasad',
        mobile1: '9712345678',
        gender: Gender.FEMALE,
        birthdate: new Date('1990-03-22'),
        area: 'Civil Lines',
        city: 'Bulandshahr',
        state: 'Uttar Pradesh',
        pincode: '203001',
        pan: 'FGHIJ5678K',
        aadhaar: '2345-6789-0123',
        occupation: 'Homemaker',
        loanLimit: 200000,
        balance: 0,
        agentId: agent1.id,
        bankName: 'Punjab National Bank',
        bankIfsc: 'PUNB0123456',
        bankAccountNo: '20234567890',
        bankAccountHolder: 'Sunita Devi',
      },
    }),
    prisma.party.create({
      data: {
        partyCode: 'PC003',
        customerId: 'CUST0003',
        name: 'Ajay Gupta',
        fatherName: 'Vijay Gupta',
        mobile1: '9723456789',
        email: 'ajay.gupta@yahoo.com',
        gender: Gender.MALE,
        birthdate: new Date('1978-11-08'),
        area: 'Model Town',
        city: 'Delhi',
        state: 'Delhi',
        pincode: '110009',
        pan: 'LMNOP9012Q',
        aadhaar: '3456-7890-1234',
        occupation: 'Shopkeeper',
        loanLimit: 1000000,
        balance: 0,
        agentId: agent2.id,
        bankName: 'HDFC Bank',
        bankIfsc: 'HDFC0001234',
        bankAccountNo: '30345678901',
        bankAccountHolder: 'Ajay Gupta',
        guarantor1Name: 'Sanjay Gupta',
        guarantor1Mobile: '9723456780',
        guarantor1Relation: 'Father',
        guarantor1Address: 'Model Town, Delhi',
      },
    }),
    prisma.party.create({
      data: {
        partyCode: 'PC004',
        customerId: 'CUST0004',
        name: 'Meena Kumari',
        fatherName: 'Ratan Lal',
        mobile1: '9734567890',
        gender: Gender.FEMALE,
        birthdate: new Date('1992-07-18'),
        area: 'Lalbagh',
        city: 'Lucknow',
        state: 'Uttar Pradesh',
        pincode: '226001',
        pan: 'RSTUV3456W',
        aadhaar: '4567-8901-2345',
        occupation: 'Teacher',
        loanLimit: 300000,
        balance: 0,
        agentId: agent2.id,
        bankName: 'Bank of Baroda',
        bankIfsc: 'BARB0LUCKNW',
        bankAccountNo: '40456789012',
        bankAccountHolder: 'Meena Kumari',
      },
    }),
    prisma.party.create({
      data: {
        partyCode: 'PC005',
        customerId: 'CUST0005',
        name: 'Dinesh Yadav',
        fatherName: 'Mahesh Yadav',
        mobile1: '9745678901',
        gender: Gender.MALE,
        birthdate: new Date('1982-01-25'),
        area: 'Vaishali Nagar',
        city: 'Jaipur',
        state: 'Rajasthan',
        pincode: '302021',
        pan: 'XYZAB7890C',
        aadhaar: '5678-9012-3456',
        occupation: 'Farmer',
        loanLimit: 250000,
        balance: 0,
        agentId: agent3.id,
        bankName: 'Axis Bank',
        bankIfsc: 'UTIB0001234',
        bankAccountNo: '50567890123',
        bankAccountHolder: 'Dinesh Yadav',
      },
    }),
    prisma.party.create({
      data: {
        partyCode: 'PC006',
        customerId: 'CUST0006',
        name: 'Kavita Sharma',
        fatherName: 'Gopal Sharma',
        mobile1: '9756789012',
        email: 'kavita.sharma@gmail.com',
        gender: Gender.FEMALE,
        birthdate: new Date('1988-09-12'),
        area: 'Gandhinagar',
        city: 'Ahmedabad',
        state: 'Gujarat',
        pincode: '382010',
        pan: 'DEFGH2345I',
        aadhaar: '6789-0123-4567',
        occupation: 'Nurse',
        loanLimit: 400000,
        balance: 0,
        agentId: agent3.id,
        bankName: 'ICICI Bank',
        bankIfsc: 'ICIC0001234',
        bankAccountNo: '60678901234',
        bankAccountHolder: 'Kavita Sharma',
      },
    }),
  ]);

  console.log('✅ Parties created');

  // ─── LOANS ───────────────────────────────────────────────────────────────
  const today = new Date();
  const loanStartDate = new Date(today);
  loanStartDate.setDate(1); // Start from 1st of month

  // LOAN 1: Simple Daily Loan - Ramesh Verma
  const loan1 = await prisma.loan.create({
    data: {
      loanNumber: 'LN202401001',
      loanType: LoanType.SIMPLE,
      status: LoanStatus.ACTIVE,
      partyId: parties[0].id,
      loanAmount: 30000,
      startDate: addDays(today, -25),
      installmentType: InstallmentType.DAILY,
      installmentAmount: 400,
      totalInstallments: 30,
      lateFine: 50,
      fileCharges: 500,
      totalPayable: 12000,
      totalPaid: 10000,
      pendingAmount: 2000,
    },
  });

  // Generate installments for loan1
  const loan1Installments = [];
  for (let i = 1; i <= 30; i++) {
    const dueDate = addDays(new Date(addDays(today, -25)), i - 1);
    let status: PaymentStatus = PaymentStatus.PENDING;
    let paidAmount = 0;
    let paidDate = null;

    if (i <= 25) {
      status = PaymentStatus.PAID;
      paidAmount = 400;
      paidDate = dueDate;
    } else if (dueDate < today) {
      status = PaymentStatus.OVERDUE;
    }

    loan1Installments.push({
      loanId: loan1.id,
      installmentNo: i,
      dueDate,
      amount: 400,
      status,
      paidAmount,
      fineAmount: 0,
      paidDate,
    });
  }
  await prisma.loanInstallment.createMany({ data: loan1Installments });

  // LOAN 2: Simple Monthly Loan - Sunita Devi
  const loan2 = await prisma.loan.create({
    data: {
      loanNumber: 'LN202401002',
      loanType: LoanType.SIMPLE,
      status: LoanStatus.ACTIVE,
      partyId: parties[1].id,
      loanAmount: 50000,
      startDate: addMonths(today, -3),
      installmentType: InstallmentType.MONTHLY,
      installmentAmount: 5500,
      totalInstallments: 12,
      lateFine: 200,
      fileCharges: 1000,
      totalPayable: 66000,
      totalPaid: 16500,
      pendingAmount: 49500,
    },
  });

  const loan2Installments = [];
  for (let i = 1; i <= 12; i++) {
    const dueDate = addMonths(new Date(addMonths(today, -3)), i - 1);
    let status: PaymentStatus = PaymentStatus.PENDING;
    let paidAmount = 0;
    let paidDate = null;

    if (i <= 3) {
      status = PaymentStatus.PAID;
      paidAmount = 5500;
      paidDate = dueDate;
    } else if (dueDate < today) {
      status = PaymentStatus.OVERDUE;
    }

    loan2Installments.push({
      loanId: loan2.id,
      installmentNo: i,
      dueDate,
      amount: 5500,
      status,
      paidAmount,
      fineAmount: 0,
      paidDate,
    });
  }
  await prisma.loanInstallment.createMany({ data: loan2Installments });

  // LOAN 3: Monthly Interest Loan - Ajay Gupta
  const loan3 = await prisma.loan.create({
    data: {
      loanNumber: 'LN202401003',
      loanType: LoanType.MONTHLY_INTEREST,
      status: LoanStatus.ACTIVE,
      partyId: parties[2].id,
      loanAmount: 200000,
      startDate: addMonths(today, -6),
      monthlyInterest: 3000,
      fileCharges: 2000,
      totalPaid: 18000,
    },
  });

  // Generate monthly interest installments
  const loan3Installments = [];
  for (let i = 1; i <= 6; i++) {
    const dueDate = addMonths(new Date(addMonths(today, -6)), i - 1);
    loan3Installments.push({
      loanId: loan3.id,
      installmentNo: i,
      dueDate,
      amount: 3000,
      status: PaymentStatus.PAID,
      paidAmount: 3000,
      fineAmount: 0,
      paidDate: dueDate,
    });
  }
  // Current month due
  loan3Installments.push({
    loanId: loan3.id,
    installmentNo: 7,
    dueDate: addMonths(today, 0),
    amount: 3000,
    status: PaymentStatus.PENDING,
    paidAmount: 0,
    fineAmount: 0,
    paidDate: null,
  });
  await prisma.loanInstallment.createMany({ data: loan3Installments });

  // LOAN 4: Recurring Daily - Meena Kumari
  const loan4 = await prisma.loan.create({
    data: {
      loanNumber: 'LN202401004',
      loanType: LoanType.RECURRING,
      status: LoanStatus.ACTIVE,
      partyId: parties[3].id,
      loanAmount: 0,
      startDate: addDays(today, -20),
      endDate: addDays(today, 80),
      installmentType: InstallmentType.DAILY,
      depositAmount: 200,
      totalInstallments: 100,
      returnPercent: 15,
      maturityAmount: 23000,
      fileCharges: 0,
      totalPaid: 4000,
    },
  });

  const loan4Installments = [];
  for (let i = 1; i <= 100; i++) {
    const dueDate = addDays(new Date(addDays(today, -20)), i - 1);
    let status: PaymentStatus = PaymentStatus.PENDING;
    let paidAmount = 0;
    let paidDate = null;

    if (i <= 20) {
      status = PaymentStatus.PAID;
      paidAmount = 200;
      paidDate = dueDate;
    } else if (dueDate < today) {
      status = PaymentStatus.OVERDUE;
    }

    loan4Installments.push({
      loanId: loan4.id,
      installmentNo: i,
      dueDate,
      amount: 200,
      status,
      paidAmount,
      fineAmount: 0,
      paidDate,
    });
  }
  await prisma.loanInstallment.createMany({ data: loan4Installments });

  // LOAN 5: Simple Weekly - Dinesh Yadav
  const loan5 = await prisma.loan.create({
    data: {
      loanNumber: 'LN202401005',
      loanType: LoanType.SIMPLE,
      status: LoanStatus.ACTIVE,
      partyId: parties[4].id,
      loanAmount: 25000,
      startDate: addDays(today, -56),
      installmentType: InstallmentType.WEEKLY,
      installmentAmount: 3000,
      totalInstallments: 10,
      lateFine: 100,
      fileCharges: 500,
      totalPayable: 30000,
      totalPaid: 24000,
      pendingAmount: 6000,
    },
  });

  const loan5Installments = [];
  for (let i = 1; i <= 10; i++) {
    const dueDate = addWeeks(new Date(addDays(today, -56)), i - 1);
    let status: PaymentStatus = PaymentStatus.PENDING;
    let paidAmount = 0;
    let paidDate = null;

    if (i <= 8) {
      status = PaymentStatus.PAID;
      paidAmount = 3000;
      paidDate = dueDate;
    } else if (dueDate < today) {
      status = PaymentStatus.OVERDUE;
    }

    loan5Installments.push({
      loanId: loan5.id,
      installmentNo: i,
      dueDate,
      amount: 3000,
      status,
      paidAmount,
      fineAmount: 0,
      paidDate,
    });
  }
  await prisma.loanInstallment.createMany({ data: loan5Installments });

  // LOAN 6: Monthly Interest - Kavita Sharma
  const loan6 = await prisma.loan.create({
    data: {
      loanNumber: 'LN202401006',
      loanType: LoanType.MONTHLY_INTEREST,
      status: LoanStatus.ACTIVE,
      partyId: parties[5].id,
      loanAmount: 100000,
      startDate: addMonths(today, -4),
      monthlyInterest: 1500,
      fileCharges: 1500,
      totalPaid: 6000,
    },
  });

  const loan6Installments = [];
  for (let i = 1; i <= 4; i++) {
    const dueDate = addMonths(new Date(addMonths(today, -4)), i - 1);
    loan6Installments.push({
      loanId: loan6.id,
      installmentNo: i,
      dueDate,
      amount: 1500,
      status: PaymentStatus.PAID,
      paidAmount: 1500,
      fineAmount: 0,
      paidDate: dueDate,
    });
  }
  // Upcoming
  loan6Installments.push({
    loanId: loan6.id,
    installmentNo: 5,
    dueDate: addMonths(today, 1),
    amount: 1500,
    status: PaymentStatus.PENDING,
    paidAmount: 0,
    fineAmount: 0,
    paidDate: null,
  });
  await prisma.loanInstallment.createMany({ data: loan6Installments });

  console.log('✅ Loans and installments created');

  // ─── PAYMENTS ─────────────────────────────────────────────────────────────
  // Create payment records for paid installments
  const paidInstallments = await prisma.loanInstallment.findMany({
    where: { status: PaymentStatus.PAID },
    include: { loan: true },
    take: 20,
  });

  let receiptCounter = 1;
  const paymentData = paidInstallments.map((inst, idx) => ({
    receiptNumber: `RCP${String(receiptCounter++ + idx).padStart(6, '0')}`,
    loanId: inst.loanId,
    installmentId: inst.id,
    agentId: idx % 2 === 0 ? agent1.id : agent2.id,
    amount: Number(inst.paidAmount),
    fineAmount: Number(inst.fineAmount),
    totalAmount: Number(inst.paidAmount) + Number(inst.fineAmount),
    paymentDate: inst.paidDate || new Date(),
    paymentMode: 'CASH',
    notes: 'Payment collected at door',
  }));

  await prisma.payment.createMany({ data: paymentData });

  console.log('✅ Payments created');

  // ─── AUDIT LOGS ───────────────────────────────────────────────────────────
  await prisma.auditLog.createMany({
    data: [
      {
        userId: admin.id,
        action: 'CREATE',
        entity: 'Loan',
        entityId: loan1.id,
        details: { loanNumber: 'LN202401001', amount: 30000 },
      },
      {
        userId: admin.id,
        action: 'CREATE',
        entity: 'Party',
        entityId: parties[0].id,
        details: { name: 'Ramesh Verma' },
      },
      {
        userId: agent1.id,
        action: 'PAYMENT',
        entity: 'Payment',
        details: { amount: 400, loan: 'LN202401001' },
      },
    ],
  });

  console.log('✅ Audit logs created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login Credentials:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('Admin:     admin@example.com    / 123456');
  console.log('Sub Admin: subadmin@example.com / 123456');
  console.log('Agent 1:   agent1@example.com   / 123456');
  console.log('Agent 2:   agent2@example.com   / 123456');
  console.log('Agent 3:   agent3@example.com   / 123456');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
