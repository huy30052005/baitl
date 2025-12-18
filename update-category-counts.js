// Utility function to update product counts for all categories
// This function should be called whenever products are added, deleted, or updated

function updateCategoryProductCounts() {
  try {
    // Get all products from localStorage
    const products = JSON.parse(localStorage.getItem("products") || "[]");
    
    // Get all categories from localStorage
    const categories = JSON.parse(localStorage.getItem("categories") || "[]");
    
    // Count products for each category
    const categoryCounts = {};
    products.forEach((product) => {
      const categoryName = product.category || "Khác";
      categoryCounts[categoryName] = (categoryCounts[categoryName] || 0) + 1;
    });
    
    // Update productCount for each category
    let categoriesUpdated = false;
    const updatedCategories = categories.map((category) => {
      const newCount = categoryCounts[category.name] || 0;
      if (category.productCount !== newCount) {
        categoriesUpdated = true;
        return { ...category, productCount: newCount };
      }
      return category;
    });
    
    // Add counts for categories that might not exist yet (but have products)
    Object.keys(categoryCounts).forEach((categoryName) => {
      const exists = updatedCategories.some((c) => c.name === categoryName);
      if (!exists) {
        // Category doesn't exist but has products - this shouldn't happen normally
        // but we'll add it with a temporary ID
        updatedCategories.push({
          id: `temp-${Date.now()}-${Math.random()}`,
          name: categoryName,
          code: "",
          icon: "📦",
          parent: "",
          description: "",
          productCount: categoryCounts[categoryName],
          status: "success",
          statusText: "Đang bán"
        });
        categoriesUpdated = true;
      }
    });
    
    // Save updated categories if there were changes
    if (categoriesUpdated) {
      localStorage.setItem("categories", JSON.stringify(updatedCategories));
    }
    
    return updatedCategories;
  } catch (error) {
    console.error("Lỗi khi cập nhật số lượng sản phẩm cho danh mục:", error);
    return [];
  }
}

// Make function available globally
window.updateCategoryProductCounts = updateCategoryProductCounts;
