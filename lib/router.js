Router.configure({
  layoutTemplate: 'layout',
  loadingTemplate: 'loading',
  notFoundTemplate: 'notFound',
  waitOn: function() {
    return [Meteor.subscribe('posts'), Meteor.subscribe('notifications')]
  } // When Meteor.subscribe returns - render it to the router's layout
  // loads the posts data into the client's side once - the first time you load the page, afterwards it remebers shit
});

Router.route('/', {name: 'postsList'});

Router.route('/posts/:_id', {
	name: 'postPage',
  waitOn: function() {
    return Meteor.subscribe('comments', this.params._id);
  },
	data: function() { return Posts.findOne(this.params._id);} // shorthand for{_id: id} so same as doing Posts.findOne({_id: id})
})

Router.route('/posts/:_id/edit', {
  name: 'postEdit',
  data: function() {
    return Posts.findOne(this.params._id);
  }
})
Router.route('/submit', {
	name: 'postSubmit'
});

var requireLogin = function() {
  if (! Meteor.user()) {
  	if (Meteor.loggingIn()) {
  		this.render(this.loadingTemplate);
  	} else {
  		this.render('accessDenied');
  	}
  } else {
    this.next();
  }
}

Router.onBeforeAction('dataNotFound', {only: 'postPage'});
Router.onBeforeAction(requireLogin, {only: 'postSubmit'});