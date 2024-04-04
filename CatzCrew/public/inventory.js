let db;
document.addEventListener("DOMContentLoaded", event => {
    const app = firebase.app();
    db = firebase.firestore();

    const ingredients = db.collection('ingredients');

    ingredients.get().then((querySnapshot) => {
        const tableBody = document.getElementById('ingredientsTable').getElementsByTagName('tbody')[0];

        querySnapshot.forEach((doc) => {
            const productData = doc.data();

            // Create a new row and cells
            let row = document.createElement('tr');
            let nameCell = document.createElement('td');
            let quantityCell = document.createElement('td');
            let descriptionCell = document.createElement('td');
            let lowStockCell = document.createElement('td');
            let costCell = document.createElement('td')

            // Set the text of the cells
            nameCell.textContent = productData.name;
            quantityCell.textContent = productData.quantity;
            descriptionCell.textContent = productData.description;
            lowStockCell.textContent = productData.lowstock;
            costCell.textContent = productData.cost

            // Add the cells to the row
            row.appendChild(nameCell);
            row.appendChild(quantityCell);
            row.appendChild(descriptionCell);
            row.appendChild(lowStockCell);
            row.appendChild(costCell);
            row.setAttribute('onclick', `displayDetails('${doc.id}')`);
            // Add the row to the table
            tableBody.appendChild(row);
        });
        updateTables();
    });
});
function displayDetails(id) {
    // Get the product data from Firestore
    db.collection('ingredients').doc(id).get().then((doc) => {
        if (doc.exists) {
            const productData = doc.data();

            // Display the product data in the input fields
            document.getElementById('productName').value = productData.name;
            document.getElementById('productDescription').value = productData.description;
            document.getElementById('productQuantity').value = productData.quantity;
            document.getElementById('productCost').value = productData.cost;
            document.getElementById('productLowStock').value = productData.lowstock;

            // Save the id of the currently displayed product
            document.getElementById('currentProduct').value = id;
        } else {
            console.log("No such document!");
        }
    }).catch((error) => {
        console.log("Error getting document:", error);
    });
}

function addProduct() {
    // Get the input values
    const ingredientName = document.getElementById('productName').value;
    const ingredientDescription = document.getElementById('productDescription').value;
    const ingredientQuantity = Number(document.getElementById('productQuantity').value);
    const ingredientCost = Number(document.getElementById('productCost').value);
    const ingredientLowStock = Number(document.getElementById('productLowStock').value);

    // Get a reference to the count document
    const countDoc = db.collection('metadata').doc('ingredientCount');

    // Run a transaction to increment the count and add the new ingredient
    db.runTransaction((transaction) => {
        return transaction.get(countDoc).then((doc) => {
            if (!doc.exists) {
                throw "Document does not exist!";
            }

            // Compute the new ID
            const newID = doc.data().count + 1;

            // Increment the count in the count document
            transaction.update(countDoc, { count: newID });

            // Add the new ingredient with the new ID
            transaction.set(db.collection('ingredients').doc(newID.toString()), {
                id: newID,
                name: ingredientName,
                description: ingredientDescription,
                quantity: ingredientQuantity,
                cost: ingredientCost,
                lowstock: ingredientLowStock
            });
        });
    }).then(() => {
        console.log('Transaction successfully committed!');
    }).catch((error) => {
        console.error('Transaction failed: ', error);
    });
}

function saveProduct() {
    // Get the input values
    const ingredientName = document.getElementById('productName').value;
    const ingredientDescription = document.getElementById('productDescription').value;

    // Convert the quantity to a number
    const ingredientQuantity = Number(document.getElementById('productQuantity').value);

    // Get the id of the currently displayed product
    const currentProduct = document.getElementById('currentProduct').value;

    // Update the product data in Firestore
    db.collection('ingredients').doc(currentProduct).set({
        name: ingredientName,
        description: ingredientDescription,
        quantity: ingredientQuantity
    }).then(() => {
        console.log("Document successfully updated!");
    }).catch((error) => {
        console.error("Error updating document: ", error);
    });
}

// For updating ingredient quantities when orders are input
function updateIngredientQuantities(orderId) {
    // Fetch the ordered product's details, including the ingredients used
    const productRef = firebase.firestore().collection('products').doc(orderId);
    productRef.get().then(doc => {
      if (doc.exists) {
        const productData = doc.data();
        const ingredients = productData.ingredients.split(',');
  
        //For loop for updating the quantity of each ingredient
        ingredients.forEach(ingredient => {
          const ingredientRef = firebase.firestore().collection('ingredients').doc(ingredient);
          ingredientRef.get().then(ingDoc => {
            if (ingDoc.exists) {
              const ingData = ingDoc.data();
              const newQuantity = ingData.quantity - productData.quantityNeeded[ingredient];
              ingredientRef.update({ quantity: newQuantity });
            }
          });
        });
      }
    });
  }
  
  function updateTables() {
    let currentStockCost = 0;
    let outOfStockItems = [];
    db.collection('ingredients').get().then(querySnapshot => {
      querySnapshot.forEach(doc => {
        const data = doc.data();
        const cost = data.cost;
        const quantity = data.quantity;
        const lowstock = data.lowstock;
  
        // Calculate current stock cost
        currentStockCost += cost * quantity;
  
        // Check for out of stock items
        if (quantity <= lowstock) {
          outOfStockItems.push(doc.data().name);
        }
      });
          // Log the outOfStockItems array for debugging
    console.log('Out of stock items:', outOfStockItems);
  
      // Update the 'current stock cost' table
      document.getElementById('stockCostTable').innerHTML = `
        <table>
          <tr>
            <th>Current Stock Cost</th>
          </tr>
          <tr>
            <td>\$${currentStockCost.toFixed(2)}</td>
          </tr>
        </table>
      `;
  
      // Update the 'out of stock' items table
      const outOfStockTableHTML = outOfStockItems.map(item => `
        <tr>
          <td>${item}</td>
        </tr>
      `).join('');
  
      document.getElementById('outOfStockTable').innerHTML = `
        <table>
          <tr>
            <th>Low Stock Items</th>
          </tr>
          ${outOfStockTableHTML}
        </table>
      `;
    });
  }