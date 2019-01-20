var rating = null;

fetch('/user',{ credentials : 'same-origin' })
.then(res => res.json())
.then(data => { 
  if(typeof data.alias !== 'undefined')
    rating = data.rating;
}).then(() => {

var rounded = Math.round(rating / 50 ) * 50;

var options = {
  type: 'line',
  data: {
    labels: ["", "", "","",""],
    datasets: [
      {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        pointBackgroundColor: 'green',
        borderColor: 'green',
        label:'',
        data: [rounded - 150, rounded - 100, rounded - 50, rounded,rounded + 50,rounded+100],
        borderWidth: 0,
        showLine: false,
        pointRadius: 0,
        pointHoverRadius:0
      },
      {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        pointBackgroundColor: 'green',
        borderColor: 'green',
        label: 'Rating',
        data: [rating - 50, rating, rating-25],
        borderWidth: 2,
        pointRadius:2,
      }      
    ]
  },
  options:{

  }
}

var ctx = document.getElementById('chartJSContainer').getContext('2d');
new Chart(ctx, options);
});


