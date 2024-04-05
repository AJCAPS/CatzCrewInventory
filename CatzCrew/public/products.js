let db;
document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    db = firebase.firestore();
    const products = db.collection('products');
    products.get().then((querySnapshot) => {
        const tableBody = document.getElementById('productTable').getElementsByTagName('tbody')[0];

        querySnapshot.forEach((doc) => {
            const productData = doc.data();

            let row = document.createElement('tr');
            let nameCell = document.createElement('td');
            let ingredientsCell = document.createElement('td');
            let descriptionCell = document.createElement('td');
            let priceCell = document.createElement('td');

            nameCell.textContent = productData.name;
            ingredientsCell.textContent = productData.ingredients;
            descriptionCell.textContent = productData.description;
            priceCell.textContent = productData.price;

            row.appendChild(nameCell);
            row.appendChild(ingredientsCell);
            row.appendChild(descriptionCell);
            row.appendChild(priceCell);
            row.setAttribute('onclick',`displayDetails('${doc.id}')`)

            tableBody.appendChild(row);
        })
    })
    
});

function displayDetails(id) {
    // Get the product data from Firestore
    db.collection('products').doc(id).get().then((doc) => {
      if (doc.exists) {
        const productData = doc.data();
  
        // Display the product data in the input fields
        document.getElementById('productPageName').value = productData.name;
        document.getElementById('productPageDescription').value = productData.description;
        document.getElementById('productPagePrice').value = productData.price;
  
        // Save the id of the currently displayed product
        document.getElementById('currentProduct').value = id;

        const products = productData.ingredients.split(', ');
  
        // Get a reference to the ingredients table
        const ingredientProductTable = document.getElementById('ingredientProductTable');
  
        // Clear the current rows in the ingredients table
        ingredientProductTable.innerHTML = '';
  
        // Create a new row in the ingredients table for each ingredient
        products.forEach(ingredient => {
          const [name, quantity] = ingredient.split('/');
  
          // Create a new row
          const row = document.createElement('tr');
  
          // Create the 'name' cell with an input box
          const nameCell = document.createElement('td');
          const nameInput = document.createElement('input');
          nameInput.type = 'text';
          nameInput.value = name;
          nameCell.appendChild(nameInput);
  
          // Create the 'quantity' cell with an input box
          const quantityCell = document.createElement('td');
          const quantityInput = document.createElement('input');
          quantityInput.type = 'number';
          quantityInput.value = quantity;
          quantityCell.appendChild(quantityInput);
  
          // Add the cells to the row
          row.appendChild(nameCell);
          row.appendChild(quantityCell);
  
          // Add the row to the table
          ingredientProductTable.appendChild(row);
        });
      } else {
        console.log("No such document!");
      }
    }).catch((error) => {
      console.log("Error getting document:", error);
    });
  }
  

function addProduct() {
    // Get the product data from the input fields
    const name = document.getElementById('productPageName').value;
    const description = document.getElementById('productPageDescription').value;
    const price = document.getElementById('productPagePrice').value;
  
    // Get a reference to the ingredients table
    const ingredientProductTable = document.getElementById('ingredientProductTable');
  
    // Get the ingredients data from the table
    let ingredients = '';
    for (let i = 0; i < ingredientProductTable.rows.length; i++) {
      const row = ingredientProductTable.rows[i];
      if (row.cells.length < 2) {
        console.error('Row does not have enough cells', row);
        continue;
      }
      const ingredientName = row.cells[0].firstChild.value;
      const ingredientQuantity = row.cells[1].firstChild.value;
      ingredients += `${ingredientName}/${ingredientQuantity}, `;
    }
    // Remove the trailing comma and space
    ingredients = ingredients.slice(0, -2);
  
    // Add a new product document to Firestore
    db.collection('products').add({
      name: name,
      description: description,
      price: price,
      ingredients: ingredients
    }).then((docRef) => {
      console.log('Document written with ID: ', docRef.id);
    }).catch((error) => {
      console.error('Error adding document: ', error);
    });
  }
/*Similar to add product, but changes value instead of using .add*/  
function saveProduct() {
    // Get the id of the currently displayed product
    const id = document.getElementById('currentProduct').value;
  
    // Get the updated product data from the input fields
    const name = document.getElementById('productPageName').value;
    const description = document.getElementById('productPageDescription').value;
    const price = document.getElementById('productPagePrice').value;
  
    // Get a reference to the ingredients table
    const ingredientProductTable = document.getElementById('ingredientProductTable');
  
    // Get the updated ingredients data from the table
    let ingredients = '';
    for (let i = 0; i < ingredientProductTable.rows.length; i++) {
      const row = ingredientProductTable.rows[i];
      const ingredientName = row.cells[0].firstChild.value;
      const ingredientQuantity = row.cells[1].firstChild.value;
      ingredients += `${ingredientName}/${ingredientQuantity}, `;
    }
    // Remove the trailing comma and space
    ingredients = ingredients.slice(0, -2);
  
    // Update the product document in Firestore
    db.collection('products').doc(id).update({
      name: name,
      description: description,
      price: price,
      ingredients: ingredients
    }).then(() => {
      console.log('Document successfully updated!');
    }).catch((error) => {
      console.error('Error updating document: ', error);
    });
  }
  function addRow() {
    // Get a reference to the ingredients table
    const ingredientProductTable = document.getElementById('ingredientProductTable');
  
    // Create a new row
    const row = document.createElement('tr');
  
    // Create the 'name' cell with an input box
    const nameCell = document.createElement('td');
    const nameInput = document.createElement('input');
    nameInput.type = 'text';
    nameCell.appendChild(nameInput);
  
    // Create the 'quantity' cell with an input box
    const quantityCell = document.createElement('td');
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityCell.appendChild(quantityInput);
  
    // Add the cells to the row
    row.appendChild(nameCell);
    row.appendChild(quantityCell);
  
    // Add the row to the table
    ingredientProductTable.appendChild(row);
  }
  function removeIngredient() {
    // Get the id of the ingredient to remove
    const ingredientId = document.getElementById('currentProduct').value;

    // Delete the ingredient document from Firestore
    db.collection('ingredients').doc(ingredientId).delete().then(() => {
        console.log("Document successfully deleted!");
    }).catch((error) => {
        console.error("Error removing document: ", error);
    });
}
