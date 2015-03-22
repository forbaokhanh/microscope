Posts = new Mongo.Collection('posts');

// Posts.allow({
// 	insert: function(userId, doc){
// 		// only allow posting if you are logged in
// 		return !! userId;
// 	}
// })

// Posts.allow({
// 	remove: function(userId, doc){
// 		// only allow removing if you are logged in
// 		return !! userId;
// 	}
// })

validatePost = function (post) {
  var errors = {};
  if (!post.title)
    errors.title = "Please fill in a headline";
  if (!post.url)
    errors.url =  "Please fill in a URL";
  return errors;
}


Posts.allow({
  update: function(userId, post) { return ownsDocument(userId, post); },
  remove: function(userId, post) { return ownsDocument(userId, post); },
});

Posts.deny({
  update: function(userId, post, fieldNames, modifier) {
    var errors = validatePost(modifier.$set);
    return errors.title || errors.url;
  }
});

/** Method calls are also more appropriate in a few other scenarios:
1. When you need to know or return values via callback rather than waiting for the reactivity and synchronization to propagate.
2. For heavy database functions that would be too expensive to ship a large collection over.
3. To summarize or aggregate data (e.g. count, average, sum). */

Meteor.methods({
	postInsert: function(postAttributes) {
		check(Meteor.userId(), String);
		check(postAttributes, {
			title: String,
			url: String
		});

		var errors = validatePost(postAttributes);
    	if (errors.title || errors.url)
      	throw new Meteor.Error('invalid-post', "You must set a title and URL for your post");

		// if (Meteor.isServer) {
	 //      postAttributes.title += "(server)";
	 //      // wait for 5 seconds
	 //      Meteor._sleepForMs(5000);
	 //    } else {
	 //      postAttributes.title += "(client)";
	 //    }

		var postWithSameLink = Posts.findOne({url: postAttributes.url});
		if (postWithSameLink) {
			return{
				postExists: true,
				_id: postWithSameLink._id
			}
		}
		var user = Meteor.user();
		// method is part of the Underscore library, and simply lets you 
		// “extend” one object with the properties of another.
		var post = _.extend(postAttributes, {
		  userId: user._id,
		  author: user.username,
		  submitted: new Date(),
		  commentsCount: 0
		});

		var postId = Posts.insert(post);
		return {
			_id: postId
		};
	}
});