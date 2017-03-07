'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Definition of the content used in the view of `Activity` instances. The key
// of the returned object match the id of the activities.
//
// Each content defines the variables that are used inside the corresponding
// [`template`]{@link module soundworks/client.defaultViewTemplates}. A special
// key `globals` is accessible among all templates and can then be used to share
// variables among all the views of the application.
// These objects are used to populate the templates declared inside the
// `~/src/client/shared/viewTemplate.js` file.
exports.default = {
  // variables shared among all templates through the global namespace
  'globals': {},

  // content of the `auth` service
  'service:auth': {
    instructions: 'Login',
    send: 'Send',
    rejectMessage: 'Sorry, you don\'t have access to this client',
    rejected: false
  },

  // content of the `checkin` service
  'service:checkin': {
    labelPrefix: 'Go to',
    labelPostfix: 'Touch the screen<br class="portrait-only" />when you are ready.',
    error: false,
    errorMessage: 'Sorry,<br/>no place available',
    wait: 'Please wait...',
    label: ''
  },

  // content of the `loader` service
  'service:loader': {
    loading: 'Loading sounds…'
  },

  // content of the `locator` service
  'service:locator': {
    instructions: 'Define your position in the area',
    send: 'Send',
    showBtn: false
  },

  // content of the `placer` service
  'service:placer': {
    instructions: 'Select your position',
    send: 'Send',
    reject: 'Sorry, no place is available',
    showBtn: false,
    rejected: false
  },

  // content of the `platform` service
  'service:platform': {
    isCompatible: null,
    errorMessage: 'Sorry,<br />Your device is not compatible with the application.',
    intro: 'Welcome to',
    instructions: 'Touch the screen to join !'
  },

  // content of the `sync` service
  'service:sync': {
    wait: 'Clock syncing,<br />stand by&hellip;'
  },

  // content of the `survey` scene
  'survey': {
    next: 'Next',
    validate: 'Validate',
    thanks: 'Thanks!',
    length: '-'
  }
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdDb250ZW50LmpzIl0sIm5hbWVzIjpbImluc3RydWN0aW9ucyIsInNlbmQiLCJyZWplY3RNZXNzYWdlIiwicmVqZWN0ZWQiLCJsYWJlbFByZWZpeCIsImxhYmVsUG9zdGZpeCIsImVycm9yIiwiZXJyb3JNZXNzYWdlIiwid2FpdCIsImxhYmVsIiwibG9hZGluZyIsInNob3dCdG4iLCJyZWplY3QiLCJpc0NvbXBhdGlibGUiLCJpbnRybyIsIm5leHQiLCJ2YWxpZGF0ZSIsInRoYW5rcyIsImxlbmd0aCJdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7a0JBQ2U7QUFDYjtBQUNBLGFBQVcsRUFGRTs7QUFJWjtBQUNELGtCQUFnQjtBQUNkQSxrQkFBYyxPQURBO0FBRWRDLFVBQU0sTUFGUTtBQUdkQyxpRUFIYztBQUlkQyxjQUFVO0FBSkksR0FMSDs7QUFZYjtBQUNBLHFCQUFtQjtBQUNqQkMsaUJBQWEsT0FESTtBQUVqQkMsa0JBQWMsaUVBRkc7QUFHakJDLFdBQU8sS0FIVTtBQUlqQkMsa0JBQWMsK0JBSkc7QUFLakJDLFVBQU0sZ0JBTFc7QUFNakJDLFdBQU87QUFOVSxHQWJOOztBQXNCYjtBQUNBLG9CQUFrQjtBQUNoQkMsYUFBUztBQURPLEdBdkJMOztBQTJCYjtBQUNBLHFCQUFtQjtBQUNqQlYsa0JBQWMsa0NBREc7QUFFakJDLFVBQU0sTUFGVztBQUdqQlUsYUFBUztBQUhRLEdBNUJOOztBQWtDYjtBQUNBLG9CQUFrQjtBQUNoQlgsa0JBQWMsc0JBREU7QUFFaEJDLFVBQU0sTUFGVTtBQUdoQlcsWUFBUSw4QkFIUTtBQUloQkQsYUFBUyxLQUpPO0FBS2hCUixjQUFVO0FBTE0sR0FuQ0w7O0FBMkNiO0FBQ0Esc0JBQW9CO0FBQ2xCVSxrQkFBYyxJQURJO0FBRWxCTixrQkFBYyxpRUFGSTtBQUdsQk8sV0FBTyxZQUhXO0FBSWxCZCxrQkFBYztBQUpJLEdBNUNQOztBQW1EYjtBQUNBLGtCQUFnQjtBQUNkUTtBQURjLEdBcERIOztBQXdEYjtBQUNBLFlBQVU7QUFDUk8sVUFBTSxNQURFO0FBRVJDLGNBQVUsVUFGRjtBQUdSQyxZQUFRLFNBSEE7QUFJUkMsWUFBUTtBQUpBO0FBekRHLEMiLCJmaWxlIjoidmlld0NvbnRlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvLyBEZWZpbml0aW9uIG9mIHRoZSBjb250ZW50IHVzZWQgaW4gdGhlIHZpZXcgb2YgYEFjdGl2aXR5YCBpbnN0YW5jZXMuIFRoZSBrZXlcbi8vIG9mIHRoZSByZXR1cm5lZCBvYmplY3QgbWF0Y2ggdGhlIGlkIG9mIHRoZSBhY3Rpdml0aWVzLlxuLy9cbi8vIEVhY2ggY29udGVudCBkZWZpbmVzIHRoZSB2YXJpYWJsZXMgdGhhdCBhcmUgdXNlZCBpbnNpZGUgdGhlIGNvcnJlc3BvbmRpbmdcbi8vIFtgdGVtcGxhdGVgXXtAbGluayBtb2R1bGUgc291bmR3b3Jrcy9jbGllbnQuZGVmYXVsdFZpZXdUZW1wbGF0ZXN9LiBBIHNwZWNpYWxcbi8vIGtleSBgZ2xvYmFsc2AgaXMgYWNjZXNzaWJsZSBhbW9uZyBhbGwgdGVtcGxhdGVzIGFuZCBjYW4gdGhlbiBiZSB1c2VkIHRvIHNoYXJlXG4vLyB2YXJpYWJsZXMgYW1vbmcgYWxsIHRoZSB2aWV3cyBvZiB0aGUgYXBwbGljYXRpb24uXG4vLyBUaGVzZSBvYmplY3RzIGFyZSB1c2VkIHRvIHBvcHVsYXRlIHRoZSB0ZW1wbGF0ZXMgZGVjbGFyZWQgaW5zaWRlIHRoZVxuLy8gYH4vc3JjL2NsaWVudC9zaGFyZWQvdmlld1RlbXBsYXRlLmpzYCBmaWxlLlxuZXhwb3J0IGRlZmF1bHQge1xuICAvLyB2YXJpYWJsZXMgc2hhcmVkIGFtb25nIGFsbCB0ZW1wbGF0ZXMgdGhyb3VnaCB0aGUgZ2xvYmFsIG5hbWVzcGFjZVxuICAnZ2xvYmFscyc6IHt9LFxuXG4gICAvLyBjb250ZW50IG9mIHRoZSBgYXV0aGAgc2VydmljZVxuICAnc2VydmljZTphdXRoJzoge1xuICAgIGluc3RydWN0aW9uczogJ0xvZ2luJyxcbiAgICBzZW5kOiAnU2VuZCcsXG4gICAgcmVqZWN0TWVzc2FnZTogYFNvcnJ5LCB5b3UgZG9uJ3QgaGF2ZSBhY2Nlc3MgdG8gdGhpcyBjbGllbnRgLFxuICAgIHJlamVjdGVkOiBmYWxzZSxcbiAgfSxcblxuICAvLyBjb250ZW50IG9mIHRoZSBgY2hlY2tpbmAgc2VydmljZVxuICAnc2VydmljZTpjaGVja2luJzoge1xuICAgIGxhYmVsUHJlZml4OiAnR28gdG8nLFxuICAgIGxhYmVsUG9zdGZpeDogJ1RvdWNoIHRoZSBzY3JlZW48YnIgY2xhc3M9XCJwb3J0cmFpdC1vbmx5XCIgLz53aGVuIHlvdSBhcmUgcmVhZHkuJyxcbiAgICBlcnJvcjogZmFsc2UsXG4gICAgZXJyb3JNZXNzYWdlOiAnU29ycnksPGJyLz5ubyBwbGFjZSBhdmFpbGFibGUnLFxuICAgIHdhaXQ6ICdQbGVhc2Ugd2FpdC4uLicsXG4gICAgbGFiZWw6ICcnLFxuICB9LFxuXG4gIC8vIGNvbnRlbnQgb2YgdGhlIGBsb2FkZXJgIHNlcnZpY2VcbiAgJ3NlcnZpY2U6bG9hZGVyJzoge1xuICAgIGxvYWRpbmc6ICdMb2FkaW5nIHNvdW5kc+KApicsXG4gIH0sXG5cbiAgLy8gY29udGVudCBvZiB0aGUgYGxvY2F0b3JgIHNlcnZpY2VcbiAgJ3NlcnZpY2U6bG9jYXRvcic6IHtcbiAgICBpbnN0cnVjdGlvbnM6ICdEZWZpbmUgeW91ciBwb3NpdGlvbiBpbiB0aGUgYXJlYScsXG4gICAgc2VuZDogJ1NlbmQnLFxuICAgIHNob3dCdG46IGZhbHNlLFxuICB9LFxuXG4gIC8vIGNvbnRlbnQgb2YgdGhlIGBwbGFjZXJgIHNlcnZpY2VcbiAgJ3NlcnZpY2U6cGxhY2VyJzoge1xuICAgIGluc3RydWN0aW9uczogJ1NlbGVjdCB5b3VyIHBvc2l0aW9uJyxcbiAgICBzZW5kOiAnU2VuZCcsXG4gICAgcmVqZWN0OiAnU29ycnksIG5vIHBsYWNlIGlzIGF2YWlsYWJsZScsXG4gICAgc2hvd0J0bjogZmFsc2UsXG4gICAgcmVqZWN0ZWQ6IGZhbHNlLFxuICB9LFxuXG4gIC8vIGNvbnRlbnQgb2YgdGhlIGBwbGF0Zm9ybWAgc2VydmljZVxuICAnc2VydmljZTpwbGF0Zm9ybSc6IHtcbiAgICBpc0NvbXBhdGlibGU6IG51bGwsXG4gICAgZXJyb3JNZXNzYWdlOiAnU29ycnksPGJyIC8+WW91ciBkZXZpY2UgaXMgbm90IGNvbXBhdGlibGUgd2l0aCB0aGUgYXBwbGljYXRpb24uJyxcbiAgICBpbnRybzogJ1dlbGNvbWUgdG8nLFxuICAgIGluc3RydWN0aW9uczogJ1RvdWNoIHRoZSBzY3JlZW4gdG8gam9pbiAhJyxcbiAgfSxcblxuICAvLyBjb250ZW50IG9mIHRoZSBgc3luY2Agc2VydmljZVxuICAnc2VydmljZTpzeW5jJzoge1xuICAgIHdhaXQ6IGBDbG9jayBzeW5jaW5nLDxiciAvPnN0YW5kIGJ5JmhlbGxpcDtgLFxuICB9LFxuXG4gIC8vIGNvbnRlbnQgb2YgdGhlIGBzdXJ2ZXlgIHNjZW5lXG4gICdzdXJ2ZXknOiB7XG4gICAgbmV4dDogJ05leHQnLFxuICAgIHZhbGlkYXRlOiAnVmFsaWRhdGUnLFxuICAgIHRoYW5rczogJ1RoYW5rcyEnLFxuICAgIGxlbmd0aDogJy0nLFxuICB9LFxufTtcbiJdfQ==