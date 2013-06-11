App = Ember.Application.create();

App.Router.map(function() {
  this.route('bindings');
  this.route('bootstrap');
  this.route('users');
  this.route('tweets');
  this.route('tweetList');
  this.resource('parent', function() {
    this.resource('child', function() {
      this.resource('grandchild');
    });
  });
});

App.BootstrapController = Ember.Controller.extend({
  progress: 20,
  type: function() {
    var progress = this.get('progress');
    if(progress < 60) { return "success"; }
    else if(progress < 90) { return "warning"; }
    else { return "error"; }
  }.property('progress'),
  message: function() {
    var type = this.get('type');
    var percentThere = this.progress + "% there";
    if(type === 'success') {
      return "Everything is good, you're only " + percentThere;
    } else if(type === 'warning') {
      return "Woah! Slow down, there's danger ahead. You are " + percentThere
    } else {
      return "KABLAMO! You are " + percentThere
    }
  }.property('type'),
  isOdd: function() {
    return this.get('progress') % 2 == 0;
  }.property('progress'),
  increaseProgress: function() {
    this.incrementProperty('progress');
  },
  decreaseProgress: function() {
    this.decrementProperty('progress');
  }
});

App.TweetsRoute = Ember.Route.extend({
  model: function() { return App.Tweet.find(); }
});

App.TweetsController = Ember.ArrayController.extend({
  sortProperties: ['date'],
  sortAscending: false,
  createTweet: function() {
    App.Tweet.createRandom();
    this.get('store').commit();
  }
});

App.TweetListRoute = Ember.Route.extend({
  model: function() { return App.Tweet.find(); },
  events: {
    createTweets: function() {
      for(var i=0; i<100; i++) {
        App.Tweet.createRandom();
      }
      this.get('store').commit();
    }
  }
});

App.UsersRoute = Ember.Route.extend({
  model: function() { return App.User.find(); }
});

App.UsersController = Ember.ArrayController.extend({
  createUser: function() {
    user = App.User.createRecord({
      username: 'user' + App.User.all().get('length'),
      avatar: App.User.avatarUrl()
    });

    this.get('store').commit();
  }
});

App.User = DS.Model.extend({
  username: DS.attr('string'),
  avatar: DS.attr('string'),
  tweets: DS.hasMany('App.Tweet'),
  changeAvatar: function() { this.set('avatar', App.User.randomAvatar()); }
}).reopenClass({
  avatarUrl: function() { return 'https://robohash.org/' + Math.random(); },
  random: function() {
    var users = App.User.all();
    var randomIndex = Math.floor((Math.random() * users.get('length')));
    return users.objectAt(randomIndex);
  }
});

App.Tweet = DS.Model.extend({
  message: DS.attr('string'),
  date: DS.attr('date'),
  user: DS.belongsTo('App.User'),
  timeAgo: function() {
    var seconds = Math.floor((new Date() - this.get('date')) / 1000);
    var interval = Math.floor(seconds / 31536000);

    interval = Math.floor(seconds / 3600);
    if (interval > 1) { return interval + " hours ago"; }
    interval = Math.floor(seconds / 60);
    if (interval > 1) { return interval + " minutes ago"; }
    return Math.floor(seconds) + " seconds ago";
  }.property('date')
}).reopenClass({
  createRandom: function() {
    var user = App.User.random();
    if(user) {
      return user.get('tweets').createRecord({
        message: App.Tweet.randomText(),
        date: new Date()
      });
    }
  },
  randomText: function() {

    return Math.random().toString(36).substring(7);
  }
});

App.Store = DS.Store.extend({ revision: 13, adapter: 'App.LSAdapter' });
App.LSAdapter = DS.LSAdapter.extend({ namespace: 'Ember.js Dublin 1' });
