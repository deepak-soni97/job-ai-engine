import type { TagInsight } from '../types';

export type { TagInsight };

export const TAG_GLOSSARY: Record<string, TagInsight> = {
  'executive trainee': {
    tag: 'Executive Trainee',
    category: 'Fast-Track Management & Leadership Cadre',
    icon: '🚀',
    roleSummary: 'An entry-level leadership development position where selected graduates undergo intensive multi-departmental training to prepare for managerial roles across public sector undertakings (PSUs) and government enterprises.',
    detailedScope: 'Executive Trainees are groomed to understand end-to-end departmental operations, corporate governance, technical planning, and project administration before regular placement as Assistant Managers or Officers.',
    coreResponsibilities: [
      'Undergoing rotational cross-functional training across operations, planning, and finance',
      'Assisting senior managers in preparing project reports, administrative memos, and compliance documentation',
      'Conducting field inspections, operational reviews, and evaluating workflow performance metrics'
    ],
    typicalQualification: 'B.Tech / B.E, MBA, M.Sc, or Graduate with minimum 60% aggregate marks (often via GATE/UGC NET score)',
    careerScope: 'Assistant Manager ➔ Manager ➔ Senior Manager ➔ General Manager'
  },
  'management trainee': {
    tag: 'Management Trainee',
    category: 'Corporate Administration & Operations',
    icon: '🎯',
    roleSummary: 'A fast-track corporate onboarding role focused on developing future managerial leaders across enterprise administration, HR, logistics, and strategy.',
    detailedScope: 'Trainees work alongside functional heads to master organizational protocols, fiscal discipline, and strategic project execution.',
    coreResponsibilities: [
      'Participating in executive decision-making and departmental strategy meetings',
      'Analyzing administrative efficiency, vendor contracts, and operational resource allocation',
      'Supervising junior clerical staff and coordinating inter-departmental task delivery'
    ],
    typicalQualification: 'MBA / PGDM in HR, Marketing, Operations, or General Management',
    careerScope: 'Management Executive ➔ Deputy Manager ➔ Functional Head'
  },
  accounts: {
    tag: 'Accounts',
    category: 'Financial Operations & Bookkeeping',
    icon: '📊',
    roleSummary: 'Responsible for recording, tracking, and reconciling all incoming and outgoing financial transactions, maintaining official ledgers, and ensuring statutory tax compliance.',
    detailedScope: 'Accounts professionals ensure organizational fiscal discipline by balancing books, filing mandatory tax returns, and managing vendor accounts.',
    coreResponsibilities: [
      'Maintaining day-to-day general ledgers, subsidiary books, and journal vouchers',
      'Processing vendor invoices, preparing payment disbursements, and reconciling bank statements',
      'Computing monthly TDS and GST liabilities, and generating trial balances'
    ],
    typicalQualification: 'B.Com, M.Com, MBA Finance, or Certification in Tally Prime / ERP 9 / SAP FICO',
    careerScope: 'Junior Accountant ➔ Senior Accountant ➔ Accounts Officer ➔ Finance Controller'
  },
  finance: {
    tag: 'Finance',
    category: 'Treasury & Capital Management',
    icon: '💼',
    roleSummary: 'Manages capital budgeting, fiscal forecasting, cash flow liquidity, and strategic investment allocations for the organization.',
    detailedScope: 'Finance professionals work at a strategic level to ensure solvency, optimize operational costs, and align expenditure with government grants and revenue.',
    coreResponsibilities: [
      'Formulating annual budgetary estimates and capital allocation roadmaps',
      'Conducting cost-benefit analyses, financial modeling, and risk assessments',
      'Managing treasury operations, investment portfolios, and debt servicing'
    ],
    typicalQualification: 'MBA Finance, Chartered Financial Analyst (CFA), M.Com, or PGDM',
    careerScope: 'Financial Analyst ➔ Finance Manager ➔ Chief Financial Officer (CFO)'
  },
  'ca / ca inter': {
    tag: 'CA / CA Inter',
    category: 'Statutory Auditing & Tax Governance',
    icon: '⚖️',
    roleSummary: 'High-level auditing and fiscal governance role responsible for verifying balance sheet truthfulness, tax integrity, and statutory legal adherence.',
    detailedScope: 'Qualified Chartered Accountants (or CA Inter candidates) oversee rigorous internal and external audits to safeguard enterprise assets against fraud and regulatory non-compliance.',
    coreResponsibilities: [
      'Executing comprehensive statutory, internal, and forensic financial audits',
      'Certifying audited financial statements, profit & loss reports, and balance sheets',
      'Advising executive leadership on corporate tax structuring and regulatory tribunal hearings'
    ],
    typicalQualification: 'Chartered Accountant (ICAI Associate/Fellow Member) or CA Inter (Group I & II Cleared)',
    careerScope: 'Audit Manager ➔ Chief Internal Auditor ➔ Partner / Director of Taxation'
  },
  ca: {
    tag: 'Chartered Accountant',
    category: 'Statutory Auditing & Fiscal Compliance',
    icon: '⚖️',
    roleSummary: 'Certified public accounting authority responsible for signing off on audited financial records, ensuring strict adherence to Companies Act regulations and Indian Accounting Standards (Ind AS).',
    detailedScope: 'Acts as the principal financial integrity guardian for corporations, banks, and government autonomous bodies.',
    coreResponsibilities: [
      'Certifying annual corporate balance sheets and public expenditure audits',
      'Managing complex direct and indirect tax litigation and statutory representations',
      'Designing risk management protocols and internal audit mechanisms'
    ],
    typicalQualification: 'Chartered Accountant (Qualified Member of ICAI)',
    careerScope: 'Chief Internal Auditor ➔ Head of Finance ➔ Board Financial Advisor'
  },
  banking: {
    tag: 'Banking',
    category: 'Retail Banking & Credit Operations',
    icon: '🏦',
    roleSummary: 'Oversees banking branch operations, customer accounts, credit risk appraisal, and the disbursement and recovery of institutional and retail loans.',
    detailedScope: 'Bank officers drive financial inclusion, safeguard public deposits, evaluate borrower creditworthiness, and administer central government fiscal schemes.',
    coreResponsibilities: [
      'Supervising daily branch cash transactions, clearing operations, and KYC records',
      'Underwriting SME, agricultural, and retail loan applications with credit assessment',
      'Monitoring NPA accounts, facilitating loan recoveries, and promoting banking products'
    ],
    typicalQualification: 'Any Bachelor Degree (Preference for B.Com / Economics) + JAIIB / CAIIB Certification',
    careerScope: 'Probationary Officer (PO) ➔ Branch Manager ➔ Chief Manager ➔ Regional Head'
  },
  'research associate': {
    tag: 'Research Associate',
    category: 'Scientific Research & Development',
    icon: '🔬',
    roleSummary: 'Conducts advanced scientific, industrial, or academic research, designing laboratory experiments, analyzing complex data, and publishing peer-reviewed discoveries.',
    detailedScope: 'Employed by premier scientific institutions (CSIR, ICMR, IITs, DRDO) to lead sponsored research projects, innovate technological solutions, and write grant proposals.',
    coreResponsibilities: [
      'Designing experimental protocols, calibrating laboratory instrumentation, and testing hypotheses',
      'Performing multivariate statistical modeling, machine learning analysis, and qualitative data synthesis',
      'Drafting technical reports, patent applications, and manuscripts for international scientific journals'
    ],
    typicalQualification: 'Ph.D, M.Sc, or M.Tech in relevant scientific or engineering discipline with valid NET / GATE score',
    careerScope: 'Senior Research Fellow ➔ Scientist B/C ➔ Principal Investigator ➔ Laboratory Director'
  },
  'technical expert': {
    tag: 'Technical Expert',
    category: 'Engineering & Specialized Technical Advisory',
    icon: '💻',
    roleSummary: 'A domain specialist who provides authoritative guidance on engineering systems, infrastructure design, industrial machinery, and software architecture.',
    detailedScope: 'Advises project stakeholders on technical feasibility, troubleshoots critical hardware/software failures, and enforces engineering safety standards.',
    coreResponsibilities: [
      'Reviewing engineering drawings, system architectures, and technical project proposals',
      'Investigating complex engineering failures and designing root-cause corrective measures',
      'Drafting technical bid specifications (RFPs) and evaluating vendor technical bids'
    ],
    typicalQualification: 'B.Tech / B.E / M.Tech / MCA with documented multi-year technical domain expertise',
    careerScope: 'Senior Technical Lead ➔ Principal Architect ➔ Chief Technology Advisor'
  },
  'marketing expert': {
    tag: 'Marketing Expert',
    category: 'Brand Strategy & Public Outreach',
    icon: '📢',
    roleSummary: 'Develops and executes public awareness campaigns, brand positioning strategies, social media communications, and consumer acquisition programs.',
    detailedScope: 'Responsible for elevating brand visibility, conducting market intelligence, and driving multi-channel engagement across digital and traditional media.',
    coreResponsibilities: [
      'Formulating comprehensive branding, advertising, and public relations campaigns',
      'Managing official social media channels, press releases, and promotional content',
      'Measuring campaign conversion metrics, audience analytics, and return on marketing spend'
    ],
    typicalQualification: 'MBA in Marketing, Master in Mass Communication, or Degree in Digital Media',
    careerScope: 'Marketing Manager ➔ Brand Director ➔ Chief Marketing Officer (CMO)'
  },
  'it engineer': {
    tag: 'IT Engineer',
    category: 'Information Technology & Software Systems',
    icon: '🖥️',
    roleSummary: 'Develops, deploys, and maintains enterprise software applications, server infrastructure, computer networks, and cloud database security.',
    detailedScope: 'Ensures uninterrupted digital operations by managing technical hardware, software updates, and organizational cybersecurity.',
    coreResponsibilities: [
      'Developing, testing, and maintaining full-stack software applications and APIs',
      'Administering enterprise LAN/WAN networks, server virtualization, and cloud instances',
      'Implementing security firewalls, access controls, and routine data disaster recovery backups'
    ],
    typicalQualification: 'B.Tech / B.E in Computer Science / IT, MCA, or M.Sc in Information Technology',
    careerScope: 'Software Engineer ➔ Senior DevOps / Cloud Engineer ➔ IT Infrastructure Head'
  },
  'staff nurse': {
    tag: 'Staff Nurse',
    category: 'Healthcare & Clinical Nursing',
    icon: '🩺',
    roleSummary: 'Delivers round-the-clock professional nursing care, monitors patient health parameters, dispenses medications, and assists physicians in clinical treatments.',
    detailedScope: 'Functions as the primary clinical caregiver in hospitals, emergency trauma units, intensive care facilities (ICU), and outpatient clinics.',
    coreResponsibilities: [
      'Continuous monitoring of patient vitals (heart rate, blood pressure, oxygen) and charting updates',
      'Administering physician-prescribed intravenous (IV) fluids, injections, and medications safely',
      'Assisting surgeons in Operation Theatres (OT) and managing post-operative surgical wound care'
    ],
    typicalQualification: 'B.Sc Nursing or GNM (General Nursing and Midwifery) with valid State Nursing Council Registration',
    careerScope: 'Senior Staff Nurse ➔ Nursing Sister ➔ Assistant Nursing Superintendent ➔ Matron'
  },
  'para legal volunteer': {
    tag: 'Para Legal Volunteer',
    category: 'Judicial & Community Legal Aid',
    icon: '⚖️',
    roleSummary: 'A trained legal aid facilitator who assists marginalized and underprivileged citizens in accessing free legal services provided by the National and District Legal Services Authorities.',
    detailedScope: 'Serves as an essential bridge between judicial courts and common citizens, resolving community grievances and organizing legal literacy camps.',
    coreResponsibilities: [
      'Educating underprivileged community members about their legal rights and welfare schemes',
      'Assisting citizens in filling out free legal aid applications for DLSA/NALSA panel advocates',
      'Facilitating amicable pre-litigation settlements during National and District Lok Adalats'
    ],
    typicalQualification: '10th / 12th Pass or Any Degree with strong civic commitment and community service aptitude',
    careerScope: 'Community Legal Counselor ➔ Legal Aid Coordinator ➔ Social Welfare Specialist'
  },
  deo: {
    tag: 'DEO / Data Entry Operator',
    category: 'Office Administration & Digital Records',
    icon: '⌨️',
    roleSummary: 'Performs rapid, accurate digitization of physical records, updates central government databases, and manages official computer correspondence.',
    detailedScope: 'Ensures office productivity through high-speed keyboard typing, data verification, digital spreadsheet organization, and electronic document filing.',
    coreResponsibilities: [
      'Digitizing handwritten and physical documents into computerized databases with speed and precision',
      'Preparing official spreadsheets, dispatch rosters, and daily operational reports in MS Office / Excel',
      'Scanning, indexing, and organizing electronic file archives for seamless retrieval'
    ],
    typicalQualification: '12th Pass / Any Bachelor Degree with certified typing speed (minimum 30-35 words per minute)',
    careerScope: 'Senior Data Associate ➔ Office Assistant ➔ Upper Division Clerk (UDC)'
  },
  clerk: {
    tag: 'Clerk / Office Assistant',
    category: 'Government Administration & Clerical Cadre',
    icon: '📁',
    roleSummary: 'Handles office administrative routines, maintaining record registries, managing incoming/outgoing correspondence, and processing routine paperwork.',
    detailedScope: 'Supports executive officers by organizing case files, maintaining office decorum, and managing public counter inquiries.',
    coreResponsibilities: [
      'Maintaining file movement registers, dispatch diaries, and public inquiry logs',
      'Drafting official routine memos, notes, circulars, and response letters',
      'Processing administrative bills, stationery requisitions, and attendance registries'
    ],
    typicalQualification: '12th Pass or Bachelor Degree with basic computer proficiency',
    careerScope: 'Lower Division Clerk (LDC) ➔ Upper Division Clerk (UDC) ➔ Section Officer'
  },
  'project manager': {
    tag: 'Project Manager',
    category: 'Project Governance & Delivery Leadership',
    icon: '🎯',
    roleSummary: 'Leads complex initiatives from inception to delivery, controlling scope, timelines, multi-disciplinary personnel, and financial budgets.',
    detailedScope: 'Ensures key deliverables are achieved on schedule while mitigating operational risks and maintaining quality compliance.',
    coreResponsibilities: [
      'Developing detailed project charters, work breakdown structures (WBS), and sprint schedules',
      'Directing cross-functional engineering, procurement, and administrative teams',
      'Monitoring project burn rate, managing vendor contracts, and reporting progress to executive leadership'
    ],
    typicalQualification: 'B.Tech / B.E or MBA with PMP / PRINCE2 certification and proven project leadership experience',
    careerScope: 'Senior Project Manager ➔ Program Director ➔ Vice President of Operations'
  },
  driver: {
    tag: 'Staff Car Driver',
    category: 'Transport & Fleet Logistics',
    icon: '🚗',
    roleSummary: 'Operates official staff vehicles for dignitary transport and official tours, adhering strictly to road safety regulations and vehicle upkeep standards.',
    detailedScope: 'Maintains vehicular mechanical fitness, ensures punctuality for administrative schedules, and preserves official trip logbooks.',
    coreResponsibilities: [
      'Safe driving of government vehicles for authorized administrative transit and official tours',
      'Conducting daily vehicle pre-trip checks (engine oil, tire pressure, brakes, battery health)',
      'Maintaining precise vehicle logbooks detailing routes, mileage, and fuel procurement receipts'
    ],
    typicalQualification: '10th Class Pass with a valid Commercial / LMV / HMV Driving License and clean driving record',
    careerScope: 'Grade II Driver ➔ Grade I Driver ➔ Special Grade Driver ➔ Fleet Supervisor'
  },
  teacher: {
    tag: 'Teacher / Lecturer',
    category: 'Academic Pedagogy & Education',
    icon: '📚',
    roleSummary: 'Educates students within academic institutions, delivering structured curriculum lesson plans, assessing learning outcomes, and nurturing intellectual growth.',
    detailedScope: 'Prepares learners for national examinations, maintains classroom discipline, and implements innovative instructional methodologies.',
    coreResponsibilities: [
      'Delivering interactive classroom lectures aligned with national/state educational standards',
      'Formulating test question papers, grading assignments, and tracking student scholastic growth',
      'Mentoring students in academic laboratories, co-curricular projects, and career counseling'
    ],
    typicalQualification: 'B.Ed with Post Graduate (PGT) / Trained Graduate (TGT) qualification and CTET / State TET clearance',
    careerScope: 'School Teacher ➔ Senior Lecturer ➔ Vice Principal ➔ Principal / Head of Institution'
  }
};

/**
 * Intelligent fallback generator that resolves unknown tags
 * using clean, professional English domain heuristics.
 */
export function getTagInsight(tag: string, departmentContext?: string): TagInsight {
  const clean = tag.trim().toLowerCase();
  
  // Exact match
  if (TAG_GLOSSARY[clean]) {
    return TAG_GLOSSARY[clean];
  }

  // Substring match
  for (const [key, value] of Object.entries(TAG_GLOSSARY)) {
    if (clean.includes(key) || key.includes(clean)) {
      return {
        ...value,
        tag: tag.trim()
      };
    }
  }

  // Token-based matching
  const tokens = clean.split(/[\s/,-]+/);
  for (const tok of tokens) {
    if (tok.length > 2 && TAG_GLOSSARY[tok]) {
      return {
        ...TAG_GLOSSARY[tok],
        tag: tag.trim()
      };
    }
  }

  // Intelligent domain categorization heuristics in pure professional English
  const isTrainee = /trainee|apprentice|intern|probation/i.test(tag);
  const isTech = /eng|tech|soft|dev|code|data|analyst|cyber|it|program/i.test(tag);
  const isMedical = /health|med|dr|physio|lab|doc|surg|hosp|nurse|pharma/i.test(tag);
  const isFinance = /cash|bank|money|tax|fund|audit|com|acc|fin/i.test(tag);
  const isLaw = /legal|court|law|judge|advoc|jur/i.test(tag);
  const isDefense = /officer|rifl|guard|const|police|arm|defen|sec/i.test(tag);
  const isMgmt = /manager|lead|director|head|chief|exec/i.test(tag);

  if (isTrainee) {
    return {
      tag: tag.trim(),
      category: 'Professional Onboarding & Training Cadre',
      icon: '🌱',
      roleSummary: `${tag.trim()} is an early-career development position designed to provide intensive on-the-job training, foundational domain exposure, and organizational mentorship.`,
      detailedScope: `Candidates selected for this cadre work under senior department heads to learn core operational workflows, compliance protocols, and technical competencies prior to permanent placement.`,
      coreResponsibilities: [
        'Undergoing structured rotational training across core operational and technical divisions',
        'Assisting senior personnel in drafting administrative notes, field logs, and status reports',
        'Demonstrating competency across periodic evaluations, technical exams, and milestone reviews'
      ],
      typicalQualification: 'Bachelor Degree or Technical Diploma in relevant discipline as specified in official notification',
      careerScope: 'Trainee ➔ Junior Executive ➔ Officer ➔ Assistant Manager'
    };
  }

  if (isMgmt) {
    return {
      tag: tag.trim(),
      category: 'Executive Management & Administration',
      icon: '🏢',
      roleSummary: `${tag.trim()} is an executive administrative position responsible for operational oversight, organizational leadership, and decision-making for the department.`,
      detailedScope: `Focuses on strategic operational delivery, team governance, resource allocation, and maintaining statutory service standards.`,
      coreResponsibilities: [
        'Supervising day-to-day administrative operations and departmental team performance',
        'Ensuring compliance with statutory government regulations, policies, and timelines',
        'Representing the department in official meetings, vendor discussions, and public forums'
      ],
      typicalQualification: 'Graduate / Post Graduate Degree with relevant managerial or administrative experience',
      careerScope: 'Assistant Manager ➔ Senior Manager ➔ General Manager'
    };
  }

  if (isTech) {
    return {
      tag: tag.trim(),
      category: 'Technology & Technical Engineering',
      icon: '⚙️',
      roleSummary: `${tag.trim()} is a specialized engineering and technology position focused on system design, technical maintenance, operational troubleshooting, and infrastructure support.`,
      detailedScope: `Delivers technical problem-solving capabilities, software/hardware architecture maintenance, and ensures digital operational reliability.`,
      coreResponsibilities: [
        'Operating and maintaining domain-specific technical infrastructure and machinery',
        'Diagnosing and resolving technical bottlenecks, system defects, and operational outages',
        'Coordinating with cross-functional engineering teams, contractors, and technology vendors'
      ],
      typicalQualification: 'B.Tech / B.E / MCA / Diploma in the relevant technical engineering discipline',
      careerScope: 'Technical Specialist ➔ Senior Engineer ➔ Lead Architect'
    };
  }

  if (isMedical) {
    return {
      tag: tag.trim(),
      category: 'Healthcare & Clinical Services',
      icon: '🏥',
      roleSummary: `${tag.trim()} is a dedicated healthcare role providing clinical patient management, medical diagnosis, diagnostic lab testing, and health delivery support.`,
      detailedScope: `Functions within hospital wards, clinics, or laboratories to maintain high standards of patient hygiene, care, and medical protocol adherence.`,
      coreResponsibilities: [
        'Delivering direct patient care, clinical evaluations, and prescribed therapeutic procedures',
        'Ensuring rigorous compliance with biomedical waste protocols and clinical sterilization',
        'Maintaining accurate patient treatment case records, diagnostic registries, and drug stocks'
      ],
      typicalQualification: 'MBBS / B.Sc / GNM / Diploma in medical sciences with relevant council registration',
      careerScope: 'Clinical Specialist ➔ Medical Officer ➔ Departmental Incharge'
    };
  }

  if (isFinance) {
    return {
      tag: tag.trim(),
      category: 'Finance, Banking & Accounting',
      icon: '💰',
      roleSummary: `${tag.trim()} is a commercial management role responsible for recording financial transactions, analyzing expenditures, and ensuring fiscal compliance.`,
      detailedScope: `Safeguards financial integrity through thorough ledger audits, tax reconciliation, and budget performance tracking.`,
      coreResponsibilities: [
        'Reconciling accounting registers, cash logs, and organizational balance sheets',
        'Preparing fiscal audit documentation, invoice records, and tax filings',
        'Monitoring financial allocations and coordinating with auditing authorities'
      ],
      typicalQualification: 'B.Com / M.Com / MBA in Finance or certified accounting qualification',
      careerScope: 'Finance Executive ➔ Senior Auditor ➔ Accounts Head'
    };
  }

  if (isLaw) {
    return {
      tag: tag.trim(),
      category: 'Legal, Judiciary & Regulatory Compliance',
      icon: '⚖️',
      roleSummary: `${tag.trim()} is a legal professional position tasked with regulatory adherence, legal documentation, contract review, and judicial compliance.`,
      detailedScope: `Protects public and organizational interests through meticulous interpretation of statutes, gazette notifications, and legal dispute management.`,
      coreResponsibilities: [
        'Drafting formal legal agreements, sworn affidavits, and judicial dispute petitions',
        'Interpreting central/state government statutes, gazette notifications, and rules',
        'Representing organizational interests before regulatory tribunals and judicial courts'
      ],
      typicalQualification: 'LLB / LLM Degree with active Bar Council enrollment where applicable',
      careerScope: 'Legal Associate ➔ Senior Law Officer ➔ Chief Legal Advisor'
    };
  }

  if (isDefense) {
    return {
      tag: tag.trim(),
      category: 'Security, Uniformed Services & Protection',
      icon: '🛡️',
      roleSummary: `${tag.trim()} is a security and uniformed cadre role responsible for maintaining law and order, protecting public assets, and enforcing safety protocols.`,
      detailedScope: `Provides vigilant security coverage, emergency incident response, and maintains discipline across operational jurisdictions.`,
      coreResponsibilities: [
        'Maintaining facility security surveillance, access control, and visitor protocols',
        'Enforcing statutory safety rules, crowd regulation, and emergency response plans',
        'Patrolling assigned zones and reporting security anomalies to senior command'
      ],
      typicalQualification: '10th / 12th Pass with prescribed Physical Standards & Fitness clearances',
      careerScope: 'Security Assistant ➔ Sub-Inspector ➔ Chief Security Officer'
    };
  }

  // Universal Professional English Fallback
  return {
    tag: tag.trim(),
    category: 'Government & Professional Cadre',
    icon: '📌',
    roleSummary: `${tag.trim()} is an officially designated professional cadre role responsible for executing core administrative, operational, and public service functions.`,
    detailedScope: `Appointed to carry out statutory duties as detailed in the official recruitment gazette notification published by ${departmentContext || 'the department'}.`,
    coreResponsibilities: [
      'Executing core duties aligned with organizational standard operating procedures (SOPs)',
      'Maintaining official documentation, files, registries, and public accountability standards',
      'Delivering project milestones and reporting to designated supervisory authorities'
    ],
    typicalQualification: 'As specified in the official recruitment notification PDF',
    careerScope: `Senior Cadre advancement within ${departmentContext || 'concerned department'}`
  };
}
