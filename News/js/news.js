/**
 * Created by 小灰 on 2018/4/18.
 */
//整体思路:
// 1.获取数据
// 2.将数据变为DOM结构,以瀑布流的方式部署到页面上
// 3.当页面滚动至底部再次获取数据循环

var curPage = 1       //第一次获取数据
var perPageCount = 10 //每次获取10个数据

var itemArr = []  //瀑布流 定义空数组,存放每一列的总高度
var colLength = parseInt($('#pic-ct').width() / $('.item').outerWidth(true))  //计算得到一排放置item的个数,即列数
for(var i = 0;i < colLength;i++){
    itemArr[i] = 0   //数组个数为colLength,初始化每个元素为0
}
start()            //保证页面初加载

function start(){
    //获取数据,变成DOM结构,瀑布流方式部署到页面
    getData(function(newList){
        $(newList).each(function(index,news){
            var $node = getNode(news)            //将数据变成DOM结构

            $node.find('img').load(function(){   //预加载图片后,将其以瀑布流方式部署在页面上
                $('#pic-ct').append($node)
                waterFallPlace($node)
            })
        })
    })
}


$(window).scroll(function(){            //页面滚动至底部#load位置,重新加载数据
    if(isVisible($('#load'))){
        start()
    }
})

//获取数据
function getData(callback){
    $.ajax({
        url: 'http://platform.sina.com.cn/slide/album_tech',
        dataType: 'jsonp',
        jsonp: 'jsoncallback',
        data:{
            app_key: '1271687855',
            num: perPageCount,
            page: curPage
        }
    }).done(function(ret){
        if(ret && ret.status && ret.status.code === "0"){   //判断数据是否正常
            callback(ret.data)                                //回调返回的数据
            curPage++
        }else{
            console.log('error')
        }
    })
}

//将数据变为DOM结构
function getNode(news){
    let html = `
<li class="item">
        <a href="${news.url}" class="link">
        <img src="${news.img_url}" alt="">
        </a>
        <h4 class="header">${news.short_name}</h4>
        <p class="content">${news.short_intro
}</p>
        </li>
            `
        return $(html)
}

//瀑布流布局
function waterFallPlace($node){
    var minItemHeight = Math.min.apply(null,itemArr)
    var minItemIndex = itemArr.indexOf(minItemHeight)

    $node.css({
        left: $('.item').outerWidth(true) * minItemIndex,
        top: minItemHeight,
        opacity: 1
    })
    itemArr[minItemIndex] += $node.outerHeight(true)  //当某一列加入新的item,该列高度加上新加的item高度,作为下一次item插入的判断依据

    $('#pic-ct').height(Math.max.apply(null,itemArr))   //注意这里需要将父容器ul高度设置成数组中的最大高度,因为数组元素item都是绝对定位,脱离了文档流,父容器高度坍塌,需要设置高度,保证底部div#load不总是可见
}

function isVisible($el){                //图片懒加载
    var elTop = $el.offset().top,         //页面顶部至目标的高度
        scrollTop = $(window).scrollTop(),//滚动距离
        windowHeight = $(window).height() //窗口高度

    if(elTop < scrollTop + windowHeight + 500){  //还没有滚动至目标就开始加载数据
        return true
    }else{
        return false
    }
}



