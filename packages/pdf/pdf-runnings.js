module.exports = {
  footer: {
    height: '1cm',
    contents: function(pageNum, numPages) {
      if (pageNum === 1) {
        return '';
      }
      return '<div style="text-align: center; font-size: 9pt; color: #666;">Page ' + pageNum + ' of ' + numPages + '</div>';
    }
  }
};
