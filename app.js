var eventproxy = require('eventproxy');
var superagent = require('superagent');
var cheerio = require('cheerio');
var url = require('url');
var ejs =require('ejs');
var express=require('express');
var app=express();
app.set('view engine', 'ejs');
app.set('view options',{layout:false});
app.set('views',__dirname+'/views');

  var cnodeUrl=('http://aisex.com/bt/thread.php?fid=14')
var topic=[];
var dotask=function(){
superagent.get(cnodeUrl)
  .end(function (err, res) {
    if (err) {
      return console.error(err);
    }
    var topicUrls = [];
    var $ = cheerio.load(res.text);
    $('a').each(function (idx, element) {
      var $element = $(element);
	if($element.text().match(/\[\d+P\]/)){
      var href =  'http://aisex.com/bt/'+$element.attr('href');
      topicUrls.push(href);
	}
    });

    var ep = new eventproxy();

    ep.after('topic_html', topicUrls.length, function (topics) {
      topics = topics.map(function (topicPair) {
        var topicUrl = topicPair[0];
        var topicHtml = topicPair[1];
        var $ = cheerio.load(topicHtml);
        var match_array=[]	
       $('img').each(function(idx,element){
       match_array.push(element.attribs.src)  
    //  match_array.push(element.src.match(/jpg/).input)
});
	//var match_array= $('img').attr('src').match(/jpg/).input;
        //console.log(match_array)
        return (
        //  title: $('h1#subject_tpc').text().trim(),
          //href: topicUrl,
          match_array// $('img').attr('src').match(/jpg/).input,
  );
      });

      console.log('final:');
      console.log(topics);
      topic=topics;
    });

    topicUrls.forEach(function (topicUrl) {
      superagent.get(topicUrl)
        .end(function (err, res) {
          console.log('fetch ' + topicUrl + ' successful');
          ep.emit('topic_html', [topicUrl, res.text]);
        });
    });
  });
};
dotask();
setInterval(dotask(),600000);
Array.prototype.shuffle = function() {
    var i = this.length;
    while(i){
        var j = Math.floor(Math.random()*i);
        var t = this[--i];
        this[i] = this[j];
        this[j] = t;
    }
    return this;
}
Array.prototype.flatten = function() {
  return Array.prototype.concat.apply([], this);
};
app.get('/',function(req,res){
output=topic.flatten().shuffle().slice(0,10);
  res.render('index.ejs',{locals:{mes:output}});
}
);
app.listen(3000);
