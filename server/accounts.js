// Accounts config
Accounts.loginServiceConfiguration.remove({
  service: "github"
});

// chicago-parties.meteor.com
// Accounts.loginServiceConfiguration.insert({
//   service: "github",
//   clientId: "5c9b7e93a5830dd3634a",
//   secret: "1fd43cfe0e0311e726e239a7a1bec03f8c3c2c89"
// });

// localhost:3000
Accounts.loginServiceConfiguration.insert({
  // @TODO look at abstracting these to envs.
  service: "github",
  clientId: "b9ef514af5fe72864a77",
  secret: "d880e1cacdeebb95804dc4801e0323410e221c53"
});

Accounts.onCreateUser(function(options, user){
  var accessToken = user.services.github.accessToken,
    result,
    profile;

	result = Meteor.http.get("https://api.github.com/user", {
    headers: {"User-Agent": "Meteor/1.0"},
    params: {
      access_token: accessToken
    }
  });

  if (result.error) {
    throw error;
  }

  profile = _.pick(result.data,
    "login",
    "name",
    "avatar_url",
    "url",
    "company",
    "blog",
    "location",
    "email",
    "bio",
    "html_url");

  user.profile = profile;

  return user;
});
