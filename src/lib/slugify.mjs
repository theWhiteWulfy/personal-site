// import * as _ from 'lodash';
// function slugify(string) {
//     return _.deburr(string).trim().toLowerCase().replace(/ /g, '-').replace(/([^a-zA-Z0-9\._-]+)/, '');
// }
// import { slugify } from './slugify.mjs';

export  function slugify(text) {
    return text.toString().trim().toLowerCase()
      .replace(/\s+/g, '-')                         // Replace spaces with -
      .replace(/([^a-zA-Z0-9\._-]+)/g, '')         // Remove all non-word chars
      .replace(/\-\-+/g, '-')                       // Replace multiple - with single -
      .replace(/^-+/, '')                           // Trim - from start of text
      .replace(/-+$/, '');                          // Trim - from end of text
  }