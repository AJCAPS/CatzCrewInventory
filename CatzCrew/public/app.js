document.addEventListener("DOMContentLoaded", event => {
    // Variable declarations below
    const app = firebase.app();
    const db = firebase.firestore();
    const ingredients = db.collection('ingredients').doc('firstingredient');
  
    ingredients.get()
      .then(doc => {
        const data = doc.data();
        document.write(data.name + '<br>');
        document.write(data.description + '<br>');
      })
      .catch(error => {
        console.error('Error getting document:', error);
      });
  
    console.log(app);
  });
  