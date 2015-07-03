function canMakePucks() {
  if (SessionStore.get('chips') >= 1000) {
    SessionStore.set('canMakePucks', true);
  } else {
    SessionStore.set('canMakePucks', false);
  }
}

function randomBikeParts(numberofChips) {
  var roll = Math.random();
  var chanceToMakeParts = 0.05 * numberofChips
  while (chanceToMakeParts > 0) {
    if (roll < chanceToMakeParts) {
      SessionStore.set('bikeParts', SessionStore.get('bikeParts') + 1 );
    }
    chanceToMakeParts--
  }
  if (SessionStore.get('bikeParts') >= 10) {
    SessionStore.set('canTradeParts', true);
  } else {
    SessionStore.set('canTradeParts', false);
  }
}

function coffeeChips() {
  var myCoffee = SessionStore.get('coffee');
  var chipsProduced = myCoffee * 0.1;
  SessionStore.set('chips', SessionStore.get('chips') + chipsProduced);
  randomBikeParts(chipsProduced);
  canMakePucks()
}

function howMuchCoffee() {
  var myWorkers = SessionStore.get('workers');
  var coffeeDrank = myWorkers * 0.1;
  var myCoffee = SessionStore.get('coffee');
  if (myWorkers > 0) {
    coffeeDrank = coffeeDrank + (myCoffee / 1000)      
  }

  return coffeeDrank
}

function workerQuit() {
  console.log('Worker Quit');
  SessionStore.set('workers', SessionStore.get('workers') - 1);
  SessionStore.set('coffee', 0); 
}

function drinkCoffee() {
  var myCoffee = SessionStore.get('coffee');
  var coffeeDrank = howMuchCoffee();
  if (myCoffee < coffeeDrank) {
    workerQuit();
  } else {
    SessionStore.set('coffee', SessionStore.get('coffee') - coffeeDrank);
  }
}

function hireWorker() {
  var myWorkers = SessionStore.get('workers');
  var maxWorkers = SessionStore.get('bikes') * 2;

  if (myWorkers > maxWorkers) {
    workerQuit();
    return;
  }

  var neededWorkers = maxWorkers - myWorkers;
  var chanceToHire = neededWorkers * .2;
  var roll = Math.random();
  var myCoffee = SessionStore.get('coffee');


  // console.log(myWorkers,maxWorkers,neededWorkers,chanceToHire,roll);
  if ((roll < chanceToHire) && (myCoffee >= 10)) {
    console.log('Hiring a worker')
    SessionStore.set('workers', SessionStore.get('workers') + 1);
  }
}
// counter starts at 0
SessionStore.setDefault('chips', 0);
SessionStore.setDefault('canMakePucks', false);
SessionStore.setDefault('pucks', 0);
SessionStore.setDefault('bikeParts', 0);
SessionStore.setDefault('canTradeParts', false);
SessionStore.setDefault('coffee', 0);
SessionStore.setDefault('canSellPucks', false);
SessionStore.setDefault('money', 0);
SessionStore.setDefault('bikes', 0);
SessionStore.setDefault('workers', 0);
SessionStore.setDefault('canBuyBike', false);
SessionStore.setDefault('canSellBike', false);

var coffeeTimer = Meteor.setInterval(coffeeChips, 1000);
var workerDrinksCoffeeTimer = Meteor.setInterval(drinkCoffee, 1000);
var workerStarts = Meteor.setInterval(hireWorker, 1000);

Template.show_chips.helpers({
  chips: function () {
    var myChips = SessionStore.get('chips');
    var fixedWidthChips = myChips.toFixed(2)
    return fixedWidthChips;
  },
});

Template.show_chips.events({
  'click .make_chips': function () {
    // increment the counter when button is clicked
    SessionStore.set('chips', SessionStore.get('chips') + 5);
    randomBikeParts(5);
    canMakePucks();  
  }
});

Template.show_pucks.helpers({
  pucks: function () {
    return SessionStore.get('pucks')  
  },  
  canMakePucks: function() {
    return SessionStore.get('canMakePucks');
  },
  canSellPucks: function() {
    return SessionStore.get('canSellPucks');
  }    
});

Template.show_pucks.events({
  'click .make_pucks': function () {
    if (SessionStore.get('chips') >= 1000) {
      SessionStore.set('chips', SessionStore.get('chips') - 1000);
      SessionStore.set('pucks', SessionStore.get('pucks') + 1);
      if (SessionStore.get('pucks') >= 10) {
        SessionStore.set('canSellPucks', true);
      } else {
        SessionStore.set('canSellPucks', false);
      }
    }
    if (SessionStore.get('chips') <= 1000) {
      SessionStore.set('canMakePucks', false);
    }
  },
  'click .sell_pucks': function () {
    if (SessionStore.get('pucks') >= 10) {
      SessionStore.set('pucks', SessionStore.get('pucks') - 10);
      SessionStore.set('money', SessionStore.get('money') + 100); 
    } 
    if (SessionStore.get('pucks') >= 10) {
      SessionStore.set('canSellPucks', true);
    } else {
      SessionStore.set('canSellPucks', false);
    }
    if (SessionStore.get('money') >= 500) {
      SessionStore.set('canBuyBike', true);
    } else {
      SessionStore.set('canBuyBike', false);
    }
  }
});

Template.show_bikeParts.helpers({
  bikeParts: function () {
    return SessionStore.get('bikeParts');
  },
  canTradeParts: function() {
    return SessionStore.get('canTradeParts');
  }
});

Template.show_bikeParts.events({
  'click .trade_parts': function () {
    if (SessionStore.get('bikeParts') >= 10) {
      SessionStore.set('bikeParts', SessionStore.get('bikeParts') - 10);
      SessionStore.set('coffee', SessionStore.get('coffee') + 20);
    }
    if (SessionStore.get('bikeParts') <= 10) {
      SessionStore.set('canTradeParts', false);
    }
  }
});

Template.show_coffee.helpers({
  coffee: function () {
    var myCoffee = SessionStore.get('coffee')
    var fixedWidthCoffee = myCoffee.toFixed(2)
    return fixedWidthCoffee;
  },
  consumedCoffee: function () {
    var myCoffee = howMuchCoffee()
    var formattedCoffee = myCoffee.toFixed(2);
    return formattedCoffee;
  }
});

Template.show_money.helpers({
  money: function () {
    return SessionStore.get('money');
  },
  canBuyBike: function () {
    return SessionStore.get('canBuyBike');
  }
});

Template.show_money.events({
  'click .buy_bike': function () {
    if (SessionStore.get('money') >= 500) {
      SessionStore.set('money', SessionStore.get('money') - 500);
      SessionStore.set('bikes', SessionStore.get('bikes') + 1);
    }
    if (SessionStore.get('money') <= 500) {
      SessionStore.set('canBuyBike', false);
    }
    if (SessionStore.get('bikes') < 1) {
      SessionStore.set('canSellBike', false);
    } else {
      SessionStore.set('canSellBike', true);
    }
  }
});

Template.show_bike.helpers({
  bikes: function () {
    return SessionStore.get('bikes');
  },
  workers: function () {
    return SessionStore.get('workers');
  },
  maxWorkers: function () {
    return SessionStore.get('bikes') * 2;
  },
  sellBikes: function () {
    return SessionStore.get('canSellBike');
  }
});

Template.show_bike.events({
  'click .sell_bike': function () {
    if (SessionStore.get('bikes') >= 1) {
      SessionStore.set('money', SessionStore.get('money') + 250);
      SessionStore.set('bikes', SessionStore.get('bikes') - 1);        
    }
    if (SessionStore.get('money') <= 500) {
      SessionStore.set('canBuyBike', false);
    }
    if (SessionStore.get('bikes') < 1) {
      SessionStore.set('canSellBike', false);
    } else {
      SessionStore.set('canSellBike', true);
    }

  }
});
