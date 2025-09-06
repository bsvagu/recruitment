import { prisma } from "./prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // Create admin user
  const hashedPassword = await bcrypt.hash("admin123", 12);
  
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@recruitportal.com" },
    update: {},
    create: {
      username: "admin",
      email: "admin@recruitportal.com",
      password: hashedPassword,
      firstName: "Admin",
      lastName: "User",
      role: "admin",
    },
  });

  console.log("✅ Created admin user:", adminUser.email);

  // Create sample companies
  const companies = [
    {
      name: "TechCorp Solutions",
      legalName: "TechCorp Solutions Inc.",
      emailDomains: ["techcorp.com"],
      companyType: "private" as const,
      employeeCountRange: "fifty_one_to_two_hundred" as const,
      industry: "technology" as const,
      specialties: ["Software Development", "Cloud Computing", "AI/ML"],
      foundedYear: 2015,
      description: "Leading technology solutions provider specializing in enterprise software and cloud infrastructure.",
      websiteUrl: "https://techcorp.com",
      linkedinUrl: "https://linkedin.com/company/techcorp",
      lifecycleStage: "customer" as const,
      recordStatus: "active" as const,
      ownerId: adminUser.id,
      tags: ["enterprise", "b2b", "saas"],
    },
    {
      name: "Green Energy Co",
      legalName: "Green Energy Company LLC",
      emailDomains: ["greenenergy.com"],
      companyType: "private" as const,
      employeeCountRange: "eleven_to_fifty" as const,
      industry: "energy" as const,
      specialties: ["Solar Power", "Wind Energy", "Sustainability"],
      foundedYear: 2018,
      description: "Renewable energy solutions for residential and commercial clients.",
      websiteUrl: "https://greenenergy.com",
      lifecycleStage: "opportunity" as const,
      recordStatus: "active" as const,
      ownerId: adminUser.id,
      tags: ["renewable", "sustainability", "b2c"],
    },
    {
      name: "HealthFirst Medical",
      legalName: "HealthFirst Medical Group",
      emailDomains: ["healthfirst.com"],
      companyType: "private" as const,
      employeeCountRange: "two_hundred_one_to_five_hundred" as const,
      industry: "healthcare" as const,
      specialties: ["Primary Care", "Telemedicine", "Preventive Medicine"],
      foundedYear: 2010,
      description: "Comprehensive healthcare services with a focus on preventive care and patient wellness.",
      websiteUrl: "https://healthfirst.com",
      lifecycleStage: "customer" as const,
      recordStatus: "active" as const,
      ownerId: adminUser.id,
      tags: ["healthcare", "medical", "telemedicine"],
    },
  ];

  const createdCompanies = [];
  for (const companyData of companies) {
    const company = await prisma.company.create({
      data: companyData,
    });
    createdCompanies.push(company);
    console.log("✅ Created company:", company.name);
  }

  // Create sample contacts
  const contacts = [
    {
      firstName: "John",
      lastName: "Smith",
      title: "Chief Technology Officer",
      department: "Engineering",
      seniority: "c_level" as const,
      companyId: createdCompanies[0].id,
      companyNameSnapshot: createdCompanies[0].name,
      headline: "Experienced technology leader with 15+ years in enterprise software",
      linkedinUrl: "https://linkedin.com/in/johnsmith",
      locationLabel: "San Francisco, CA",
      isCurrentEmployee: true,
      lifecycleStage: "customer" as const,
      recordStatus: "active" as const,
      ownerId: adminUser.id,
      tags: ["decision-maker", "technical"],
    },
    {
      firstName: "Sarah",
      lastName: "Johnson",
      title: "VP of Operations",
      department: "Operations",
      seniority: "vp" as const,
      companyId: createdCompanies[1].id,
      companyNameSnapshot: createdCompanies[1].name,
      headline: "Operations executive focused on sustainable business practices",
      linkedinUrl: "https://linkedin.com/in/sarahjohnson",
      locationLabel: "Austin, TX",
      isCurrentEmployee: true,
      lifecycleStage: "opportunity" as const,
      recordStatus: "active" as const,
      ownerId: adminUser.id,
      tags: ["operations", "sustainability"],
    },
    {
      firstName: "Dr. Michael",
      lastName: "Chen",
      prefix: "Dr.",
      title: "Medical Director",
      department: "Medical",
      seniority: "director" as const,
      companyId: createdCompanies[2].id,
      companyNameSnapshot: createdCompanies[2].name,
      headline: "Board-certified physician and healthcare technology advocate",
      linkedinUrl: "https://linkedin.com/in/michaelchen",
      locationLabel: "Boston, MA",
      isCurrentEmployee: true,
      lifecycleStage: "customer" as const,
      recordStatus: "active" as const,
      ownerId: adminUser.id,
      tags: ["medical", "healthcare", "leadership"],
    },
  ];

  for (const contactData of contacts) {
    const contact = await prisma.contact.create({
      data: contactData,
    });
    console.log("✅ Created contact:", `${contact.firstName} ${contact.lastName}`);

    // Add sample email for each contact
    await prisma.email.create({
      data: {
        entityType: "contact",
        entityId: contact.id,
        type: "work",
        email: `${contact.firstName.toLowerCase()}.${contact.lastName.toLowerCase()}@${contactData.companyId === createdCompanies[0].id ? 'techcorp.com' : contactData.companyId === createdCompanies[1].id ? 'greenenergy.com' : 'healthfirst.com'}`,
        isPrimary: true,
        isVerified: true,
      },
    });

    // Add sample phone for each contact
    await prisma.phone.create({
      data: {
        entityType: "contact",
        entityId: contact.id,
        type: "work",
        phone: `+1 (555) ${Math.floor(Math.random() * 900) + 100}-${Math.floor(Math.random() * 9000) + 1000}`,
        isPrimary: true,
        isVerified: false,
      },
    });
  }

  // Add sample addresses for companies
  const companyAddresses = [
    {
      entityType: "company",
      entityId: createdCompanies[0].id,
      type: "hq" as const,
      label: "Headquarters",
      street1: "123 Tech Street",
      city: "San Francisco",
      state: "CA",
      postalCode: "94105",
      countryCode: "US",
      isPrimary: true,
    },
    {
      entityType: "company",
      entityId: createdCompanies[1].id,
      type: "hq" as const,
      label: "Main Office",
      street1: "456 Green Avenue",
      city: "Austin",
      state: "TX",
      postalCode: "73301",
      countryCode: "US",
      isPrimary: true,
    },
    {
      entityType: "company",
      entityId: createdCompanies[2].id,
      type: "hq" as const,
      label: "Medical Center",
      street1: "789 Health Boulevard",
      city: "Boston",
      state: "MA",
      postalCode: "02101",
      countryCode: "US",
      isPrimary: true,
    },
  ];

  for (const addressData of companyAddresses) {
    await prisma.address.create({
      data: addressData,
    });
  }

  console.log("🎉 Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });