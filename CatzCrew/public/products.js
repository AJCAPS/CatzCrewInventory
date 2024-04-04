let db;
document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    db = firebase.firestore();

    // Call function to display products
    displayProducts();
});

function selectProduct(productId) {
    // Logic to handle product selection
    // This function would be called when a user selects a product
    // It should fetch the product details, parse the ingredients list,
    // and update the Firebase database accordingly
}

// Additional functions as needed...

// Function to display products
function displayProducts() {
  // Fetch products from the database
  db.collection('products').get().then(querySnapshot => {
    querySnapshot.forEach(doc => {
      const productData = doc.data();
      // Display each product on the page
      // You would create HTML elements here and append them to the page
      console.log(productData.name); // Placeholder for actual display logic
    });
  });
}

// Function to update ingredient quantities when a product is selected
function updateIngredients(product) {
  // Parse the product's ingredient list
  const ingredientsList = product.ingredients.split(', ');
  ingredientsList.forEach(ingredientInfo => {
    const [ingredient, quantityNeeded] = ingredientInfo.split('/');
    // Fetch the ingredient from the database and update its quantity
    const ingredientRef = db.collection('ingredients').doc(ingredient);
    db.runTransaction(transaction => {
      return transaction.get(ingredientRef).then(ingDoc => {
        if (!ingDoc.exists) {
          throw "Ingredient does not exist!";
        }
        const newQuantity = ingDoc.data().quantity - parseInt(quantityNeeded, 10);
        transaction.update(ingredientRef, { quantity: newQuantity });
      });
    }).then(() => {
      console.log('Ingredient quantities updated successfully');
    }).catch(error => {
      console.error('Transaction failed: ', error);
    });
  });
}

// Call displayProducts when the page loads
document.addEventListener("DOMContentLoaded", () => {
  displayProducts();
});
