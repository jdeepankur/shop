/*
 * This was a starting point -- now complete!
 * This code is based on the template provided in StudRes
 * The regex pattern for email is based on the RFC2822 standard
 */

/*
 * item_id: string (id of item)
 * element: string (tag name of element)
 */

function getStockItemValue(item_id, element) {
  var i = document.getElementById(item_id);
  var e = i.getElementsByTagName(element)[0];  // assume only 1!
  var v = e.innerHTML;
  return v;
}

/*
 * item_id: string (id of item)
 * element: string (tag name of element)
 * value: string (the value of the element)
 */
function setStockItemValue(item_id, element, value) {
  var i = document.getElementById(item_id);
  var e = i.getElementsByTagName(element)[0];  // assume only 1!
  e.innerHTML = value;
}

/*
 * e: object from DOM tree (item_quantity that made )
 * item_id: string (id of item)
 */
function updateLineCost(e, item_id) {
  var p = getStockItemValue(item_id, "item_price");
  var q = e.value;
  var c = p * q; // implicit type conversion
  c = c.toFixed(2); // 2 decimal places always.
  setStockItemValue(item_id, "line_cost", c);

  updateSubTotal();
  // Also need to update sub_total, delivery_charge, vat, and total.
}

function updateCosts(item_id) {
  const inputField = document.getElementById(item_id).getElementsByTagName('item_quantity')[0].getElementsByTagName('input')[0]
  updateLineCost(inputField, item_id);
}

function updateSubTotal(){
  var sub_total = 0.00;
  const stockList = document.getElementsByTagName("stock_list")[0].getElementsByTagName("stock_item");
  for (i in stockList) {
    if (i>0) sub_total += parseFloat(stockList[i].getElementsByTagName("line_cost")[0].innerText)
  }

  sub_total = sub_total.toFixed(2);

  document.getElementById("sub_total").innerHTML = sub_total;
  updateDeliveryCharge(sub_total);
}

function updateDeliveryCharge(sub_total){
  var dcf = document.getElementById("delivery_charge"); //dcf stands for deliveryChargeField
  var delivCharge = 0;

  if (sub_total < 100) {
    delivCharge = sub_total * 0.10;
  }
  else {
    delivCharge = 0;
  }

  dcf.innerHTML = delivCharge.toFixed(2);
  updateVAT(parseFloat(sub_total), parseFloat(delivCharge));
}

function updateVAT(sub_total, delivCharge){
  var vtf = document.getElementById("vat"); //vtf stands for VATField
  var vatAmount = 0;

  vatAmount = 0.20 * (sub_total + delivCharge);
  vtf.innerHTML = vatAmount.toFixed(2);

  updateTotal(parseFloat(sub_total), parseFloat(delivCharge), parseFloat(vatAmount));
}

function updateTotal(sub_total, delivCharge, vatAmount){
  var ttf = document.getElementById("total"); //ttf stands for TotalField
  var totalAmount = 0;

  totalAmount = sub_total + delivCharge + vatAmount;
  ttf.innerHTML = totalAmount.toFixed(2);
}


function validateForm(){
  //Wait for user confirmation
  document.getElementsByTagName("h1")[0].innerText = "Order Confirmation";
  document.getElementsByTagName("h1")[0].innerHTML += "<h3>Please check through your purchases and your details, and edit them if necessary before submitting.<\/h3>";

  allInputFields = document.getElementsByTagName("input");
  for (i in allInputFields){
    allInputFields[i].disabled = true;
  }
  document.getElementsByName("submit")[0].style = "visibility:hidden";
  document.getElementsByTagName("select")[0].disabled = true;
  document.getElementById("order_submit").innerHTML = "<button class=\"no\" onclick=\"unsealForm()\">Go Back<\/button>&nbsp;<button class=\"yes\" onclick=\"confirm()\">Confirm Order<\/button>" + document.getElementById("order_submit").innerHTML;

}

function unsealForm(){
  document.getElementsByTagName("h1")[0].innerText = "Items for Sale";

  allInputFields = document.getElementsByTagName("input");
  for (i in allInputFields){
    allInputFields[i].disabled = false;
  }
  document.getElementById("order_submit").innerHTML = "<input type=\"submit\" name=\"submit\" onclick=\"validateForm()\" value=\"Press here to place your order.\">";
  document.getElementsByName("submit")[0].style = "visibility:visible";
  document.getElementsByTagName("select")[0].disabled = false;
}

function confirm(){
    //Validating the Inputs

    //Comparing Credit Card Number with Type
    const cc_type = document.getElementById("cc_type");
    const cc_number = document.getElementById("cc_number");
    const visa_format = /4\d{15}/; //first digit is five followed by 15 digits
    const master_format = /5\d{15}/; //first digit is five followed by 15 digits
    switch(cc_type.value){
      case "Visa":
        if (visa_format.test(cc_number.value)){
          break;
        }
        else{
          window.alert("That is not a valid VISA credit card! Please try again.");
          unsealForm();
          return;
        }
      case "Mastercard":
          if (master_format.test(cc_number.value)){
            break;
          }
          else{
            window.alert("That is not a valid MasterCard! Please try again.");
            unsealForm();
            return;
          }
       default:
         window.alert("Please enter a valid credit card type!");
         unsealForm();
         return;
    }

    //Checking Credit Card CVC
    const cc_code = document.getElementById("cc_code").value;
    if (cc_code==parseInt(cc_code) && 100<=cc_code && cc_code<=999){}
    else{
      window.alert("Please enter a valid credit card security code!");
      unsealForm();
      return;
    }

    //Check Item Quantities
    const quantList = document.getElementsByTagName("item_quantity");
    for (i in quantList) {
      quantVal = 0;
      //console.log(quantList[i].getElementsByTagName("input")[0].value);
      if (i>0) {
        quantVal = quantList[i].getElementsByTagName("input")[0].value;
      }
      if (quantVal<0 || quantVal!=parseInt(quantVal)){
        window.alert("The requested quantity for " + quantList[i].parentNode.getElementsByTagName("item_name")[0].innerText + " is impossible. Please check what you've entered.");
        unsealForm();
        return;
      }
    }
    //Check that at least one quantity is filled in. We can have some 0s but not all of them!
    const subTotal = document.getElementById("sub_total").innerText;
    if (subTotal <= 0){
      window.alert("You need to order at least one item.");
      unsealForm();
      return;
    }

    //Check Email Address
    const emailID = document.getElementById("email");
    //Citation - The below regex pattern is based on the publicly available RFC2822 e-mail standard as defined by https://tools.ietf.org/id/draft-seantek-mail-regexen-03.html and provided by https://regex-generator.olafneumann.org/
    const email_format = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;
    if (emailID.value.search(email_format)!=0){
      window.alert("That is not a valid email address! Please try again.");
      unsealForm();
      return;
    }

    //Check that all details are filled in
    const detailFields = document.getElementsByTagName("p")
    for (i in detailFields){
      if (parseInt(i)!=i) continue;
      if (i>0 && detailFields[i].getElementsByTagName("input")[0].value == ''){
        window.alert("You have not filled in your " + detailFields[i].firstChild.textContent.replace(":", "!"));
        unsealForm();
        return;
      };
    }

    //Allow POST to happen since all inputs are correctly formatted
    unsealForm();
  	document.getElementsByName("order")[0].submit();
}

function cleanTable(){
  rows = document.getElementsByTagName("td");
  var i = 0;
  for (i in rows){
    switch (rows[i].innerText) {
     case "cc_name":
      rows[i].innerText = "Customer Name: ";
      break;
     case "cc_number":
      rows[i].innerText = "Credit Card Number: ";
      i = parseInt(i);
      rows[i+1].innerText = rows[i+1].innerText.substring(0,2) + "XXXXXXXXXXXX" + rows[i+1].innerText.substring(14);
      break;
     case "cc_type":
      rows[i].innerText = "Credit Card Type: ";
      break;
     case "delivery_address":
      rows[i].innerText = "Street Address: ";
      break;
     case "delivery_postcode":
      rows[i].innerText = "Postcode: ";
      break;
     case "delivery_country":
      rows[i].innerText = "Country: ";
      break;
     case "delivery_country":
        rows[i].innerText = "Country: ";
        break;
     case "email":
        rows[i].innerText = "Email Address: ";
        break;
    default:
      rows[i].innerText = String(rows[i].innerText).replace(/\+/g, " ");
      rows[i].innerText = String(rows[i].innerText).replace(/%40/g, "@");
      rows[i].innerText = String(rows[i].innerText).replace(/%23/g, "#");
      break;
    }
  }
}
