import $ from 'jquery';
import Service from '@ember/service';

export default Service.extend({
  deleteMedia(realtivePath) {
    return $.post('./api/images/delete', [realtivePath]);
  }
});
