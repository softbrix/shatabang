import $ from 'jquery';
import Service from '@ember/service';

export default Service.extend({
  deleteMedia(realtivePath) {
    return $.ajax({
      url: './api/images/delete',
      type: "POST",
      contentType:"application/json; charset=utf-8",
      dataType: "text",
      data: JSON.stringify([realtivePath])
    });
  }
});
