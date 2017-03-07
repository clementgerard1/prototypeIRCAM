'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
// Definition of the templates used in the view of `Activity` instances. The key
// of the returned object match the id of the activities.
// These template should be seen as a starting point and modified according
// to the need of the application. Also, the `exprience` template could be
// defined here.
//
// The templates are internally parsed using the `lodash.template` system
// (see [https://lodash.com/docs#template]{@link https://lodash.com/docs#template}
// for more information).
// Variables used inside a given template are declared inside the
// `~/src/client/shared/viewContent.js` file.
exports.default = {
  // template of the `auth` service
  'service:auth': '\n    <% if (!rejected) { %>\n      <div class="section-top flex-middle">\n        <p><%= instructions %></p>\n      </div>\n      <div class="section-center flex-center">\n        <div>\n          <input type="password" id="password" />\n          <button class="btn" id="send"><%= send %></button>\n        </div>\n      </div>\n      <div class="section-bottom"></div>\n    <% } else { %>\n      <div class="section-top"></div>\n      <div class="section-center flex-center">\n        <p><%= rejectMessage %></p>\n      </div>\n      <div class="section-bottom"></div>\n    <% } %>\n  ',

  // template of the `checkin` service
  'service:checkin': '\n    <% if (label) { %>\n      <div class="section-top flex-middle">\n        <p class="big"><%= labelPrefix %></p>\n      </div>\n      <div class="section-center flex-center">\n        <div class="checkin-label">\n          <p class="huge bold"><%= label %></p>\n        </div>\n      </div>\n      <div class="section-bottom flex-middle">\n        <p class="small"><%= labelPostfix %></p>\n      </div>\n    <% } else { %>\n      <div class="section-top"></div>\n      <div class="section-center flex-center">\n        <p><%= error ? errorMessage : wait %></p>\n      </div>\n      <div class="section-bottom"></div>\n    <% } %>\n  ',

  // template of the `loader` service
  'service:loader': '\n    <div class="section-top flex-middle">\n      <p><%= loading %></p>\n    </div>\n    <div class="section-center flex-center">\n      <% if (showProgress) { %>\n      <div class="progress-wrap">\n        <div class="progress-bar"></div>\n      </div>\n      <% } %>\n    </div>\n    <div class="section-bottom"></div>\n  ',

  // template of the `locator` service
  'service:locator': '\n    <div class="section-square"></div>\n    <div class="section-float flex-middle">\n      <% if (!showBtn) { %>\n        <p class="small"><%= instructions %></p>\n      <% } else { %>\n        <button class="btn"><%= send %></button>\n      <% } %>\n    </div>\n  ',

  // template of the `placer` service
  'service:placer': '\n    <div class="section-square<%= mode === \'list\' ? \' flex-middle\' : \'\' %>">\n      <% if (rejected) { %>\n      <div class="fit-container flex-middle">\n        <p><%= reject %></p>\n      </div>\n      <% } %>\n    </div>\n    <div class="section-float flex-middle">\n      <% if (!rejected) { %>\n        <% if (mode === \'graphic\') { %>\n          <p><%= instructions %></p>\n        <% } else if (mode === \'list\') { %>\n          <% if (showBtn) { %>\n            <button class="btn"><%= send %></button>\n          <% } %>\n        <% } %>\n      <% } %>\n    </div>\n  ',

  // template of the `platform` service
  'service:platform': '\n    <% if (!isCompatible) { %>\n      <div class="section-top"></div>\n      <div class="section-center flex-center">\n        <p><%= errorMessage %></p>\n      </div>\n      <div class="section-bottom"></div>\n    <% } else { %>\n      <div class="section-top flex-middle"></div>\n      <div class="section-center flex-center">\n          <p class="big">\n            <%= intro %>\n            <br />\n            <b><%= globals.appName %></b>\n          </p>\n      </div>\n      <div class="section-bottom flex-middle">\n        <p class="small soft-blink"><%= instructions %></p>\n      </div>\n    <% } %>\n  ',

  // template of the `sync` service
  'service:sync': '\n    <div class="section-top"></div>\n    <div class="section-center flex-center">\n      <p class="soft-blink"><%= wait %></p>\n    </div>\n    <div class="section-bottom"></div>\n  ',

  // template of the `survey` scene
  survey: '\n    <div class="section-top">\n      <% if (counter <= length) { %>\n        <p class="counter"><%= counter %> / <%= length %></p>\n      <% } %>\n    </div>\n    <% if (counter > length) { %>\n      <div class="section-center flex-center">\n        <p class="big"><%= thanks %></p>\n      </div>\n    <% } else { %>\n      <div class="section-center"></div>\n    <% } %>\n    <div class="section-bottom flex-middle">\n      <% if (counter < length) { %>\n        <button class="btn"><%= next %></button>\n      <% } else if (counter === length) { %>\n        <button class="btn"><%= validate %></button>\n      <% } %>\n    </div>\n  '
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInZpZXdUZW1wbGF0ZXMuanMiXSwibmFtZXMiOlsic3VydmV5Il0sIm1hcHBpbmdzIjoiOzs7OztBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7a0JBQ2U7QUFDYjtBQUNBLGdtQkFGYTs7QUF1QmI7QUFDQSxvcEJBeEJhOztBQThDYjtBQUNBLDJWQS9DYTs7QUE2RGI7QUFDQSxrU0E5RGE7O0FBeUViO0FBQ0EsaW1CQTFFYTs7QUErRmI7QUFDQSxnb0JBaEdhOztBQXNIYjtBQUNBLDRNQXZIYTs7QUErSGI7QUFDQUE7QUFoSWEsQyIsImZpbGUiOiJ2aWV3VGVtcGxhdGVzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gRGVmaW5pdGlvbiBvZiB0aGUgdGVtcGxhdGVzIHVzZWQgaW4gdGhlIHZpZXcgb2YgYEFjdGl2aXR5YCBpbnN0YW5jZXMuIFRoZSBrZXlcbi8vIG9mIHRoZSByZXR1cm5lZCBvYmplY3QgbWF0Y2ggdGhlIGlkIG9mIHRoZSBhY3Rpdml0aWVzLlxuLy8gVGhlc2UgdGVtcGxhdGUgc2hvdWxkIGJlIHNlZW4gYXMgYSBzdGFydGluZyBwb2ludCBhbmQgbW9kaWZpZWQgYWNjb3JkaW5nXG4vLyB0byB0aGUgbmVlZCBvZiB0aGUgYXBwbGljYXRpb24uIEFsc28sIHRoZSBgZXhwcmllbmNlYCB0ZW1wbGF0ZSBjb3VsZCBiZVxuLy8gZGVmaW5lZCBoZXJlLlxuLy9cbi8vIFRoZSB0ZW1wbGF0ZXMgYXJlIGludGVybmFsbHkgcGFyc2VkIHVzaW5nIHRoZSBgbG9kYXNoLnRlbXBsYXRlYCBzeXN0ZW1cbi8vIChzZWUgW2h0dHBzOi8vbG9kYXNoLmNvbS9kb2NzI3RlbXBsYXRlXXtAbGluayBodHRwczovL2xvZGFzaC5jb20vZG9jcyN0ZW1wbGF0ZX1cbi8vIGZvciBtb3JlIGluZm9ybWF0aW9uKS5cbi8vIFZhcmlhYmxlcyB1c2VkIGluc2lkZSBhIGdpdmVuIHRlbXBsYXRlIGFyZSBkZWNsYXJlZCBpbnNpZGUgdGhlXG4vLyBgfi9zcmMvY2xpZW50L3NoYXJlZC92aWV3Q29udGVudC5qc2AgZmlsZS5cbmV4cG9ydCBkZWZhdWx0IHtcbiAgLy8gdGVtcGxhdGUgb2YgdGhlIGBhdXRoYCBzZXJ2aWNlXG4gICdzZXJ2aWNlOmF1dGgnOiBgXG4gICAgPCUgaWYgKCFyZWplY3RlZCkgeyAlPlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICAgIDxwPjwlPSBpbnN0cnVjdGlvbnMgJT48L3A+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgICA8ZGl2PlxuICAgICAgICAgIDxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBpZD1cInBhc3N3b3JkXCIgLz5cbiAgICAgICAgICA8YnV0dG9uIGNsYXNzPVwiYnRuXCIgaWQ9XCJzZW5kXCI+PCU9IHNlbmQgJT48L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbVwiPjwvZGl2PlxuICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3BcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgICA8cD48JT0gcmVqZWN0TWVzc2FnZSAlPjwvcD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG4gICAgPCUgfSAlPlxuICBgLFxuXG4gIC8vIHRlbXBsYXRlIG9mIHRoZSBgY2hlY2tpbmAgc2VydmljZVxuICAnc2VydmljZTpjaGVja2luJzogYFxuICAgIDwlIGlmIChsYWJlbCkgeyAlPlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wIGZsZXgtbWlkZGxlXCI+XG4gICAgICAgIDxwIGNsYXNzPVwiYmlnXCI+PCU9IGxhYmVsUHJlZml4ICU+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImNoZWNraW4tbGFiZWxcIj5cbiAgICAgICAgICA8cCBjbGFzcz1cImh1Z2UgYm9sZFwiPjwlPSBsYWJlbCAlPjwvcD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWJvdHRvbSBmbGV4LW1pZGRsZVwiPlxuICAgICAgICA8cCBjbGFzcz1cInNtYWxsXCI+PCU9IGxhYmVsUG9zdGZpeCAlPjwvcD5cbiAgICAgIDwvZGl2PlxuICAgIDwlIH0gZWxzZSB7ICU+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi10b3BcIj48L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlciBmbGV4LWNlbnRlclwiPlxuICAgICAgICA8cD48JT0gZXJyb3IgPyBlcnJvck1lc3NhZ2UgOiB3YWl0ICU+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b21cIj48L2Rpdj5cbiAgICA8JSB9ICU+XG4gIGAsXG5cbiAgLy8gdGVtcGxhdGUgb2YgdGhlIGBsb2FkZXJgIHNlcnZpY2VcbiAgJ3NlcnZpY2U6bG9hZGVyJzogYFxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPlxuICAgICAgPHA+PCU9IGxvYWRpbmcgJT48L3A+XG4gICAgPC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICA8JSBpZiAoc2hvd1Byb2dyZXNzKSB7ICU+XG4gICAgICA8ZGl2IGNsYXNzPVwicHJvZ3Jlc3Mtd3JhcFwiPlxuICAgICAgICA8ZGl2IGNsYXNzPVwicHJvZ3Jlc3MtYmFyXCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDwlIH0gJT5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b21cIj48L2Rpdj5cbiAgYCxcblxuICAvLyB0ZW1wbGF0ZSBvZiB0aGUgYGxvY2F0b3JgIHNlcnZpY2VcbiAgJ3NlcnZpY2U6bG9jYXRvcic6IGBcbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1zcXVhcmVcIj48L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1mbG9hdCBmbGV4LW1pZGRsZVwiPlxuICAgICAgPCUgaWYgKCFzaG93QnRuKSB7ICU+XG4gICAgICAgIDxwIGNsYXNzPVwic21hbGxcIj48JT0gaW5zdHJ1Y3Rpb25zICU+PC9wPlxuICAgICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiPjwlPSBzZW5kICU+PC9idXR0b24+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgLy8gdGVtcGxhdGUgb2YgdGhlIGBwbGFjZXJgIHNlcnZpY2VcbiAgJ3NlcnZpY2U6cGxhY2VyJzogYFxuICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXNxdWFyZTwlPSBtb2RlID09PSAnbGlzdCcgPyAnIGZsZXgtbWlkZGxlJyA6ICcnICU+XCI+XG4gICAgICA8JSBpZiAocmVqZWN0ZWQpIHsgJT5cbiAgICAgIDxkaXYgY2xhc3M9XCJmaXQtY29udGFpbmVyIGZsZXgtbWlkZGxlXCI+XG4gICAgICAgIDxwPjwlPSByZWplY3QgJT48L3A+XG4gICAgICA8L2Rpdj5cbiAgICAgIDwlIH0gJT5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1mbG9hdCBmbGV4LW1pZGRsZVwiPlxuICAgICAgPCUgaWYgKCFyZWplY3RlZCkgeyAlPlxuICAgICAgICA8JSBpZiAobW9kZSA9PT0gJ2dyYXBoaWMnKSB7ICU+XG4gICAgICAgICAgPHA+PCU9IGluc3RydWN0aW9ucyAlPjwvcD5cbiAgICAgICAgPCUgfSBlbHNlIGlmIChtb2RlID09PSAnbGlzdCcpIHsgJT5cbiAgICAgICAgICA8JSBpZiAoc2hvd0J0bikgeyAlPlxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiPjwlPSBzZW5kICU+PC9idXR0b24+XG4gICAgICAgICAgPCUgfSAlPlxuICAgICAgICA8JSB9ICU+XG4gICAgICA8JSB9ICU+XG4gICAgPC9kaXY+XG4gIGAsXG5cbiAgLy8gdGVtcGxhdGUgb2YgdGhlIGBwbGF0Zm9ybWAgc2VydmljZVxuICAnc2VydmljZTpwbGF0Zm9ybSc6IGBcbiAgICA8JSBpZiAoIWlzQ29tcGF0aWJsZSkgeyAlPlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgPHA+PCU9IGVycm9yTWVzc2FnZSAlPjwvcD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tXCI+PC9kaXY+XG4gICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLXRvcCBmbGV4LW1pZGRsZVwiPjwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICAgICAgPHAgY2xhc3M9XCJiaWdcIj5cbiAgICAgICAgICAgIDwlPSBpbnRybyAlPlxuICAgICAgICAgICAgPGJyIC8+XG4gICAgICAgICAgICA8Yj48JT0gZ2xvYmFscy5hcHBOYW1lICU+PC9iPlxuICAgICAgICAgIDwvcD5cbiAgICAgIDwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tYm90dG9tIGZsZXgtbWlkZGxlXCI+XG4gICAgICAgIDxwIGNsYXNzPVwic21hbGwgc29mdC1ibGlua1wiPjwlPSBpbnN0cnVjdGlvbnMgJT48L3A+XG4gICAgICA8L2Rpdj5cbiAgICA8JSB9ICU+XG4gIGAsXG5cbiAgLy8gdGVtcGxhdGUgb2YgdGhlIGBzeW5jYCBzZXJ2aWNlXG4gICdzZXJ2aWNlOnN5bmMnOiBgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+PC9kaXY+XG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tY2VudGVyIGZsZXgtY2VudGVyXCI+XG4gICAgICA8cCBjbGFzcz1cInNvZnQtYmxpbmtcIj48JT0gd2FpdCAlPjwvcD5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b21cIj48L2Rpdj5cbiAgYCxcblxuICAvLyB0ZW1wbGF0ZSBvZiB0aGUgYHN1cnZleWAgc2NlbmVcbiAgc3VydmV5OiBgXG4gICAgPGRpdiBjbGFzcz1cInNlY3Rpb24tdG9wXCI+XG4gICAgICA8JSBpZiAoY291bnRlciA8PSBsZW5ndGgpIHsgJT5cbiAgICAgICAgPHAgY2xhc3M9XCJjb3VudGVyXCI+PCU9IGNvdW50ZXIgJT4gLyA8JT0gbGVuZ3RoICU+PC9wPlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICAgIDwlIGlmIChjb3VudGVyID4gbGVuZ3RoKSB7ICU+XG4gICAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1jZW50ZXIgZmxleC1jZW50ZXJcIj5cbiAgICAgICAgPHAgY2xhc3M9XCJiaWdcIj48JT0gdGhhbmtzICU+PC9wPlxuICAgICAgPC9kaXY+XG4gICAgPCUgfSBlbHNlIHsgJT5cbiAgICAgIDxkaXYgY2xhc3M9XCJzZWN0aW9uLWNlbnRlclwiPjwvZGl2PlxuICAgIDwlIH0gJT5cbiAgICA8ZGl2IGNsYXNzPVwic2VjdGlvbi1ib3R0b20gZmxleC1taWRkbGVcIj5cbiAgICAgIDwlIGlmIChjb3VudGVyIDwgbGVuZ3RoKSB7ICU+XG4gICAgICAgIDxidXR0b24gY2xhc3M9XCJidG5cIj48JT0gbmV4dCAlPjwvYnV0dG9uPlxuICAgICAgPCUgfSBlbHNlIGlmIChjb3VudGVyID09PSBsZW5ndGgpIHsgJT5cbiAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0blwiPjwlPSB2YWxpZGF0ZSAlPjwvYnV0dG9uPlxuICAgICAgPCUgfSAlPlxuICAgIDwvZGl2PlxuICBgLFxufTtcbiJdfQ==