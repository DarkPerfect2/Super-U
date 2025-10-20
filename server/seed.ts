import { connectDatabase, getCollections } from "./db";
import bcrypt from "bcrypt";

async function seed() {
  console.log("🌱 Starting database seed...");

  try {
    await connectDatabase();

    const { categories, products, pickupSlots, users } = await getCollections();

    // Clear existing data
    await categories.deleteMany({});
    await products.deleteMany({});
    await pickupSlots.deleteMany({});
    await users.deleteMany({});

    // Create categories
    const categoriesData = [
      {
        name: "Fruits & Légumes",
        slug: "fruits-legumes",
        imageUrl: "https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=400&h=300&fit=crop",
        description: "Produits frais de saison",
        productCount: 0,
      },
      {
        name: "Viandes & Poissons",
        slug: "viandes-poissons",
        imageUrl: "https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=400&h=300&fit=crop",
        description: "Viandes et poissons frais",
        productCount: 0,
      },
      {
        name: "Produits Laitiers",
        slug: "produits-laitiers",
        imageUrl: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?w=400&h=300&fit=crop",
        description: "Lait, fromages, yaourts",
        productCount: 0,
      },
      {
        name: "épicerie",
        slug: "epicerie",
        imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=300&fit=crop",
        description: "Conserves, pâtes, riz, huiles",
        productCount: 0,
      },
      {
        name: "Boissons",
        slug: "boissons",
        imageUrl: "https://images.unsplash.com/photo-1523677011781-c91d1bbe2f34?w=400&h=300&fit=crop",
        description: "Boissons fraîches et alcoolisées",
        productCount: 0,
      },
      {
        name: "Boulangerie",
        slug: "boulangerie",
        imageUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop",
        description: "Pain frais et viennoiseries",
        productCount: 0,
      },
      {
        name: "Hygiène & Beauté",
        slug: "hygiene-beaute",
        imageUrl: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=300&fit=crop",
        description: "Produits d'hygiène et cosmétiques",
        productCount: 0,
      },
      {
        name: "Entretien",
        slug: "entretien",
        imageUrl: "https://images.unsplash.com/photo-1610657820036-dfd1b5b94e25?w=400&h=300&fit=crop",
        description: "Produits d'entretien et nettoyage",
        productCount: 0,
      },
    ];

    console.log("Creating categories...");
    const result = await categories.insertMany(categoriesData as any);
    const createdCategories = categoriesData.map((cat, idx) => ({
      ...cat,
      _id: result.insertedIds[idx],
    }));

    // Create products with proper category association
    const productsData = [
      // Fruits & Légumes
      { sku: "FL001", name: "Bananes", description: "Bananes mûres et sucrées", price: 1500, images: ["https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=600&h=600&fit=crop"], stock: 50, categoryId: createdCategories[0]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "FL002", name: "Tomates", description: "Tomates fraîches et juteuses", price: 800, images: ["https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=600&h=600&fit=crop"], stock: 40, categoryId: createdCategories[0]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "FL003", name: "Pommes de terre", description: "Pommes de terre de qualité", price: 1200, images: ["https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&h=600&fit=crop"], stock: 60, categoryId: createdCategories[0]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },

      // Viandes & Poissons
      { sku: "VP001", name: "Poulet entier", description: "Poulet fermier frais", price: 4500, images: ["https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=600&h=600&fit=crop"], stock: 20, categoryId: createdCategories[1]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "VP002", name: "Filet de tilapia", description: "Poisson frais du Congo", price: 3500, images: ["https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?w=600&h=600&fit=crop"], stock: 15, categoryId: createdCategories[1]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },

      // Produits Laitiers
      { sku: "PL001", name: "Lait entier 1L", description: "Lait frais pasteurisé", price: 1800, images: ["https://images.unsplash.com/photo-1550583724-b2692b85b150?w=600&h=600&fit=crop"], stock: 30, categoryId: createdCategories[2]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "PL002", name: "Yaourt nature", description: "Yaourt nature 4x125g", price: 2200, images: ["https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&h=600&fit=crop"], stock: 25, categoryId: createdCategories[2]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },

      // Épicerie
      { sku: "EP001", name: "Riz 5kg", description: "Riz long grain", price: 5500, images: ["https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&h=600&fit=crop"], stock: 45, categoryId: createdCategories[3]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "EP002", name: "Huile végétale 1L", description: "Huile de palme raffinée", price: 2800, images: ["https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=600&h=600&fit=crop"], stock: 35, categoryId: createdCategories[3]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "EP003", name: "Pâtes 500g", description: "Spaghetti de qualité", price: 1200, images: ["https://images.unsplash.com/photo-1551462147-ff29053bfc14?w=600&h=600&fit=crop"], stock: 50, categoryId: createdCategories[3]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },

      // Boissons
      { sku: "BO001", name: "Eau minérale 1.5L", description: "Eau plate naturelle", price: 600, images: ["https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=600&fit=crop"], stock: 100, categoryId: createdCategories[4]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "BO002", name: "Jus d'orange 1L", description: "Jus 100% pur fruit", price: 1800, images: ["https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&h=600&fit=crop"], stock: 30, categoryId: createdCategories[4]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },

      // Boulangerie
      { sku: "BL001", name: "Pain complet", description: "Pain frais du jour", price: 800, images: ["https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&h=600&fit=crop"], stock: 40, categoryId: createdCategories[5]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "BL002", name: "Croissants x6", description: "Croissants pur beurre", price: 2500, images: ["https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&h=600&fit=crop"], stock: 20, categoryId: createdCategories[5]._id.toString(), isPerishable: true, isActive: true, ratingAverage: 0, ratingCount: 0 },

      // Hygiène & Beauté
      { sku: "HB001", name: "Savon de toilette", description: "Savon antibactérien", price: 1200, images: ["https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=600&h=600&fit=crop"], stock: 50, categoryId: createdCategories[6]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "HB002", name: "Dentifrice", description: "Dentifrice protection complète", price: 1500, images: ["https://images.unsplash.com/photo-1622786344615-0fc96e5591e3?w=600&h=600&fit=crop"], stock: 40, categoryId: createdCategories[6]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },

      // Entretien
      { sku: "EN001", name: "Lessive liquide 2L", description: "Lessive pour tout le linge", price: 3500, images: ["https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?w=600&h=600&fit=crop"], stock: 30, categoryId: createdCategories[7]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },
      { sku: "EN002", name: "Javel 1L", description: "Eau de javel désinfectante", price: 1200, images: ["https://images.unsplash.com/photo-1563453392212-326f5e854473?w=600&h=600&fit=crop"], stock: 35, categoryId: createdCategories[7]._id.toString(), isPerishable: false, isActive: true, ratingAverage: 0, ratingCount: 0 },
    ];

    console.log("Creating products...");
    await products.insertMany(productsData as any);

    // Update product counts for each category
    console.log("Updating product counts...");
    for (const category of createdCategories) {
      const count = await products.countDocuments({ categoryId: category._id.toString() });
      await categories.updateOne(
        { _id: category._id },
        { $set: { productCount: count } }
      );
    }

    // Create pickup slots for next 7 days
    console.log("Creating pickup slots...");
    const slotsToCreate = [];
    const today = new Date();
    for (let i = 1; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];

      slotsToCreate.push(
        {
          date: dateStr,
          timeFrom: "08:00",
          timeTo: "10:00",
          capacity: 50,
          remaining: 50,
          isActive: true,
        },
        {
          date: dateStr,
          timeFrom: "10:00",
          timeTo: "12:00",
          capacity: 50,
          remaining: 50,
          isActive: true,
        },
        {
          date: dateStr,
          timeFrom: "14:00",
          timeTo: "16:00",
          capacity: 50,
          remaining: 50,
          isActive: true,
        },
        {
          date: dateStr,
          timeFrom: "16:00",
          timeTo: "18:00",
          capacity: 50,
          remaining: 50,
          isActive: true,
        }
      );
    }
    await pickupSlots.insertMany(slotsToCreate as any);

    // Create test user
    console.log("Creating test user...");
    const hashedPassword = await bcrypt.hash("password123", 10);
    try {
      await users.insertOne({
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      } as any);
    } catch (e) {
      console.log("Test user might already exist");
    }

    console.log("✅ Seed completed successfully!");
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
}

seed();
