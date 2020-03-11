const PRICE = 1040;

// getUrlParamter is a cross-browser JS function to fetch URL query parameters.
// name should be a string of the query parameter's name.
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
};

// renderPaypalButtons will render the Paypal payment buttons.
// amount should be a string of the payment amount in cents USD.
function renderPaypalButtons(amount) {
    // Set up shipping and pickup options
    var TRANSACTION_MODEL = {
        intent: "CAPTURE",
        application_context: {
            "shipping_preference": "NO_SHIPPING",
            "return_url": "https://storagewithbob.github.io/payment_success.html",
            "cancel_url": "https://storagewithbob.github.io/pre-pay.html",
        },
        purchase_units: [{
            amount: {
                currency_code: "USD",
                value: amount,
            },
        }]
    };
    paypal.Buttons({
        createOrder: function(data, actions) {
            return actions.order.create(TRANSACTION_MODEL);
        },
        onApprove(data, actions) {
            var preCapture = Promise.resolve();
            return actions.order.get().then(order => {
                return preCapture.then(() => actions.order.capture());
            });

        }
    }).render("#paypal-button-container"); // Display payment options on your web page
}


(function() {
    var cubicFtString = getUrlParameter('cf');
    if (cubicFtString.length === 0) { 
        alert('Missing query parameter for cubic feet: "cf"');
        window.location.replace('order.html');
        return;
    }
    var cubicFtInt = parseInt(cubicFtString);
    if (cubicFtInt === NaN || cubicFtInt <= 0) { 
        alert('Query parameter for cubic feet must be a positive integer.');
        window.location.replace('order.html');
        return;
    }
    var totalCentsInt = cubicFtInt * PRICE;
    var totalCentsString = totalCentsInt.toString();
    var totalDollarsFloat = totalCentsInt / 100;
    var totalDollarsString = totalDollarsFloat.toPrecision(totalCentsString.length);
    document.getElementById('cubic-ft').innerText = cubicFtString;
    document.getElementById('total-price').innerText = totalDollarsString;
    renderPaypalButtons(totalDollarsString);
})();
