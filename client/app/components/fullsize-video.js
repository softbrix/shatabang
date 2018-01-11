import FullsizeImage from './fullsize-image';

export default FullsizeImage.extend({
  tagName: 'video',
  attributeBindings: ['imgSrc:src', 'imgAlt:alt', 'controls', 'autoplay'],

  controls: true,
  autoplay: true
});
