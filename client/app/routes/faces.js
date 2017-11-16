import Route from '@ember/routing/route';

export default Route.extend({
  model() {
    var canvas = document.createElement("CANVAS");
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    return [
      {"key":"2013/01/22/112039.JPG","items":
        [{"x":2242,"y":220,"w":254,"h":254},
         {"x":780,"y":490,"w":1400,"h":1400}]
      },{"key":"2013/01/22/112420.JPG","items":
        [{"x":1000,"y":141,"w":123,"h":123},
        {"x":762,"y":1531,"w":411,"h":411}]
      },{"key":"2013/01/12/134803.JPG","items":
        [{"x":1205,"y":645,"w":76,"h":76},
         {"x":1185,"y":875,"w":90,"h":90}]
      },{"key":"2013/01/12/134847.JPG","items":
        [{"x":1153,"y":486,"w":103,"h":103},
        {"x":1427,"y":939,"w":86,"h":86}]
      }].map(function(img) {
        img.items.map(function(itm) {
          var dW = Math.round(itm.w/5),
            dH = Math.round(itm.h/5);
          itm.w = itm.w + 2*dW;
          itm.h = itm.h + 2*dH;

          itm.l = itm.x - dW;
          itm.t = itm.y - dH;

          itm.r = itm.l + itm.w;
          itm.b = itm.t + itm.h;

          // Crop image with canvas

          var imageObj = new Image();
          imageObj.onload = function() {
            console.log('loaded');
            canvas.width = itm.w;
            canvas.height = itm.h;
            canvas.getContext('2d').drawImage(imageObj, itm.l, itm.t, itm.w, itm.h, 0, 0, itm.w, itm.h);

            itm.src = canvas.toDataURL("image/png");
            // console.log(itm.src);
          };

          itm.src = './assets/img/' + img.key;
          //imageObj.src = './assets/img/' + img.key;

          return itm;
        });
        return img;
      });
  }
});
