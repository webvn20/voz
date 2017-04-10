window.App = window.App || {};

;(function(App, $, _) {
    'use trict';

    var FONT_SIZES      = [13, 15, 17, 19, 21, 23, 25];

    var currentFontSize = 21;
    var storageKey      = 'chapterCurrentFontSize';

    var plusFontSize    = '.plus-font-size';
    var minusFontSize   = '.minus-font-size';
    var chapterContent  = '#chapter-content';

    function getCurrentFontSize() {
        var size = parseInt(localStorage.getItem(storageKey));
        if ( ! size) size = currentFontSize;

        return _.contains(FONT_SIZES, size) ? size : 21;
    }

    function setCurrentFontSize(size) {
        currentFontSize = size;
        localStorage.setItem(storageKey, size);
    }

    function changeFontSize(type) {
        var index = _.indexOf(FONT_SIZES, getCurrentFontSize());
        var size  = (type == 'minus') ? FONT_SIZES[index-1] : FONT_SIZES[index+1];

        if (_.isUndefined(size)) return;

        if (_.last(FONT_SIZES) === size || _.first(FONT_SIZES) === size)
        {
            var element = (type == 'minus') ? minusFontSize : plusFontSize;
            $(element).addClass('disabled');
        }
        else
        {
            $(plusFontSize).removeClass('disabled');
            $(minusFontSize).removeClass('disabled');
        }

        setCurrentFontSize(size);
        $(chapterContent).animate({ 'font-size': size+'px' }, 150);
    }

    App.ChapterUi = {
        changeFontSize: changeFontSize,
        render: function() {
            $(chapterContent).css('font-size', getCurrentFontSize()+'px');

            $(plusFontSize).on('click', function() {
                changeFontSize('plus');
            });

            $(minusFontSize).on('click', function() {
                changeFontSize('minus');
            });

            key('[', function() {
                changeFontSize('minus');
            });

            key(']', function() {
                changeFontSize('plus');
            });
        }
    };

})(window.App, jQuery, _);

(function($) {
    var FOLLOW_BUTTON = '[data-script=follow]';
    var TEMPLATE =
        '<div class="btn-group" data-script="follow" data-followed="<%= isFollowed %>" data-id="<%= id %>" data-count="<%= count %>">'+
            '<button class="btn btn-xs <%= isFollowed ? "btn-danger" : "btn-primary" %>">'+
                '<i class="fa fa-fw <%= isFollowed ? "fa-times" : "fa-plus" %>"></i>'+
                '<span><%= isFollowed ? "Hủy theo dõi" : "Theo dõi" %></span>'+
            '</button>'+
            '<button type="button" class="btn btn-xs <%= isFollowed ? "btn-danger" : "btn-primary" %>">'+
                '<span class="count"><%= count %></span>'+
            '</button>'+
        '</div>';

    function ajaxAction(id, isFollowed, count, $el) {
        return $.ajax({
            url: base_url+'/api/story/'+id+'/'+(isFollowed ? 'unfollow' : 'follow'),
            type: 'POST',
            success: function() {
                if(isFollowed) {
                    count--;
                } else {
                    count++;
                }

                var template = _.template(TEMPLATE, {id: id, isFollowed: ! isFollowed, count: count});
                $el.replaceWith(template);
            },
            error: function(res) {
                alert(res.responseText);
            },
        });
    }

    $(document).on('click', FOLLOW_BUTTON, function(e) {
        e.preventDefault();

        var id  = $(this).data('id');
        var isFollowed = $(this).data('followed');
        var count = $(this).data('count');

        var xhr = ajaxAction(id, isFollowed, count, $(this));
    });

})(jQuery);

var PIKADAY_I18N_VI = {
    previousMonth : 'Tháng trước',
    nextMonth     : 'Tháng sau',
    months        : ['Tháng 1', 'Tháng 2', 'Tháng 3', 'Tháng 4', 'Tháng 5', 'Tháng 6', 'Tháng 7', 'Tháng 8', 'Tháng 9', 'Tháng 10', 'Tháng 11', 'Tháng 12'],
    weekdays      : ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'],
    weekdaysShort : ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7']
};

jQuery.fn.extend({
    insertAtCaret: function(myValue) {
        return this.each(function(i) {
            if (document.selection) {
                //For browsers like Internet Explorer
                this.focus();
                var sel = document.selection.createRange();
                sel.text = myValue;
                this.focus();
            } else if (this.selectionStart || this.selectionStart == '0') {
                //For browsers like Firefox and Webkit based
                var startPos = this.selectionStart;
                var endPos = this.selectionEnd;
                var scrollTop = this.scrollTop;
                this.value = this.value.substring(0, startPos) + myValue + this.value.substring(endPos, this.value.length);
                this.focus();
                this.selectionStart = startPos + myValue.length;
                this.selectionEnd = startPos + myValue.length;
                this.scrollTop = scrollTop;
            } else {
                this.value += myValue;
                this.focus();
            }
        });
    }
});

$(function() {
    $(document).on('click', '[data-script=like]', function(e) {
        e.preventDefault();

        var $el     = $(this);
        var id      = $el.data('id');
        var type    = $el.data('type');

        $.ajax({
            url: base_url+'/api/'+type+'/'+id+'/like',
            type: 'POST',
            success: function(e) {
                if (e.likes) $el.parent().find('.count').text(e.likes);
                $el.parent().find('.btn').addClass('disabled');
            },
        });

    });
});

$(function() {

    $.ajaxSetup({
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content')
        }
    });

});

$(function() {

    App.SearchEngine.init($('#search'));

    $('.dropdown > .dropdown-menu').on('click', function(e) {
        e.stopPropagation();
    });

    $('select.selecter').selecter();

    $("input[type='number']").stepper();

    $('input[type=checkbox].icheck, input[type=radio].icheck').iCheck({
        checkboxClass: 'icheckbox_flat',
        radioClass: 'iradio_flat'
    });

    $('[data-toggle=popover]').popover();

    $('[data-toogle=tooltip]').tooltip();

    $('time').each(function(index, el) {
        var time = $(el).attr('datetime');
        if (time) $(el).text(moment(time).fromNow());
    });

});

window.App = window.App || {};

;(function() {
    'use trict';

    _.compile = function(templ) {
        var compiled = this.template(templ);

        compiled.render = function(ctx) {
            return this(ctx);
        }

        return compiled;
    }

    var suggestionTemplate = '<div class="media"><div class="media-body"><h4 class="media-heading text-overflow"><%= title %></h4><p class="text-muted text-overflow small" style="margin-bottom: 0">Cập nhật cuối lúc: <%= moment(updated_at).fromNow() %></p></div></div>';

    var suggestionUsersTemplate = '<div class="media"><div class="pull-left"><img src="<% if(typeof avatar != "undefined") { %><%= avatar %><% } %>" width="45px" class="media-object img-circle">    </div>    <div class="media-body"><h4 class="media-heading text-overflow"><%= username %></h4><p class="reset text-muted text-overflow small"><% if(typeof fullname != "undefined") { %><%= fullname %><% } %></p>    </div><div class="clearfix"></div></div>';

    App.SearchEngine = {};
    App.SearchEngine.stories = App.SearchEngine.users = {};

    App.SearchEngine.Stories = new Bloodhound({
        limit: 7,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // prefetch: base_url+'/api/prefetch/stories.json',
        remote: base_url+'/api/search/stories.json?q=%QUERY'
    });

    App.SearchEngine.Users = new Bloodhound({
        limit: 5,
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('username'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        // prefetch: base_url+'/api/prefetch/users.json',
        remote: base_url+'/api/search/users.json?q=%QUERY'
    });

    App.SearchEngine.init = function(search) {

        this.Stories.initialize();

        search.typeahead(
            {
                highlight: true,
                minLength: 1,
            },
            {
                name: 'search-stories',
                displayKey: 'title',
                source: App.SearchEngine.Stories.ttAdapter(),
                dupDetector: true,
                templates: {
                    header: '<h3 class="tt-header">Tìm kiếm truyện</h3>',
                    suggestion: _.compile(suggestionTemplate),
                    empty: '<div class="tt-no-result">Không tìm thấy kết quả nào.</div>'
                }
            }
        );

        var selectedData = null;

        search.on('typeahead:selected', function(e, data, typeName) {
            window.location.href = data.link;
        });

        search.on('typeahead:selected typeahead:autocompleted', function(e, data, typeName) {
            selectedData = data;
        });

        search.closest('form').on('submit', function(e) {
            if (selectedData) {
                window.location.href = selectedData.link;
                return false;
            }
        });

        return search;
    };

    App.SearchEngine.initUsers = function(search) {

        this.Users.initialize();

        search.typeahead(
            {
                highlight: true,
                minLength: 2,
            },
            {
                name: 'search-users',
                displayKey: 'username',
                source: App.SearchEngine.Users.ttAdapter(),
                dupDetector: true,
                templates: {
                    header: '<h3 class="tt-header">Kết quả tìm kiếm</h3>',
                    suggestion: _.compile(suggestionUsersTemplate),
                    empty: '<div class="tt-no-result">Không tìm thấy tài khoản nào.</div>'
                }
            }
        );

        search.on('typeahead:selected', function(e, data, typeName) {
            window.location.href = data.link;
        });

        return search;
    };

    App.SearchEngine.initInbox = function(search) {

        this.Users.initialize();

        search.typeahead(
            {
                highlight: true,
                minLength: 2,
            },
            {
                name: 'search-users',
                displayKey: 'username',
                source: App.SearchEngine.Users.ttAdapter(),
                dupDetector: true,
                templates: {
                    header: '<h3 class="tt-header">Kết quả tìm kiếm</h3>',
                    suggestion: _.compile(suggestionUsersTemplate),
                    empty: '<div class="tt-no-result">Không tìm thấy tài khoản nào.</div>'
                }
            }
        );

        // var selectedData = null;

        search.on('typeahead:selected', function(e, data, typeName) {
            search.val(data.username);
        });

        // search.on('typeahead:selected typeahead:autocompleted', function(e, data, typeName) {
        //     selectedData = data;
        // });

        // search.closest('form').on('submit', function(e) {
        //     if (selectedData) {
        //         window.location.href = selectedData.link;
        //         return false;
        //     }
        // });

        return search;
    };

})(window.App, Bloodhound, _);

(function($) {
    var FOLLOW_BUTTON = '[data-script=follow-user]';
    var TEMPLATE =
        '<button class="btn btn-block <%= isFollowed ? "btn-danger" : "btn-primary" %>" data-script="follow-user" data-followed="<%= isFollowed %>" data-id="<%= id %>">'+
            '<i class="fa fa-fw <%= isFollowed ? "fa-times" : "fa-plus" %>"></i>'+
            '<span><%= isFollowed ? "Hủy theo dõi" : "Theo dõi" %></span>'+
        '</button>';

    function ajaxAction(id, isFollowed, $el, remove, parent) {
        return $.ajax({
            url: base_url+'/api/user/'+id+'/'+(isFollowed ? 'unfollow' : 'follow'),
            type: 'POST',
            success: function() {
                if(remove == 1) {
                    $el.closest(parent).remove();
                } else {
                    var template = _.template(TEMPLATE, {id: id, isFollowed: ! isFollowed});
                    $el.replaceWith(template);
                }
            },
            error: function(res) {
                alert(res.responseText);
            },
        });
    }

    $(document).on('click', FOLLOW_BUTTON, function(e) {
        e.preventDefault();

        var id  = $(this).data('id');
        var isFollowed = $(this).data('followed');
        var remove = $(this).data('remove');
        var parent = $(this).data('parent');

        var xhr = ajaxAction(id, isFollowed, $(this), remove, parent);
    });

})(jQuery);

var Binh_Luan = {
    trang_binh_luan: 1,
    key_binh_luan: '',
    login: false,
    type: 'story', // story or chapter

    config: function(config) {

    },

    logged: function(){
        Binh_Luan.login = true;
    },

    setType: function(type){
        Binh_Luan.type = type;
    },

    loadMore: function() {
        Binh_Luan.trang_binh_luan += 1;
        Binh_Luan.load_binh_luan();
    },

    submit_binhluan: function() {
        if(!Binh_Luan.login)
        {
            alert('Bạn phải đăng nhập trước khi gửi bình luận.');

            return false;
        }

        var DOM = $("#binh_luan_area");

        if (DOM.css('display') == 'none') {
            DOM.css('display', 'block');

            $("#comment-content-area").focus();

            return false;
        }

        var link = base_url + '/api/'+Binh_Luan.type+'/'+Binh_Luan.key_binh_luan+'/comment';

        $.post(link, $("#binhluanForm").serialize(), function(data) {
            if (data['error'])
            {
                return alert(data['error_str']);
            }

            $("#comment-content-area").val('');

            $("#comment-broadcast").remove();

            Binh_Luan.trang_binh_luan = 1;
            Binh_Luan.load_binh_luan();

            $("#list-comments-media").html('');

            return true;
        });

        return true;
    },

    load_binh_luan: function() {
        var trang = Math.max(Binh_Luan.trang_binh_luan, 1),
            sort = $('#comment-sort').val();

        var dom1 = $("#PrevBLLink");

        if (trang > 1)
        {
            dom1.css('display', 'block');
        }else{
            dom1.css('display', 'none');
        }

        var link = base_url + '/api/'+Binh_Luan.type+'/'+Binh_Luan.key_binh_luan+'/comment.json?page='+trang+'&sort='+sort;
        var DOM  = $("#list-comments-media");

        DOM.append('<div class="text-center mt-10 mb-10" id="loading"><div class="ajax-loading"></div></div>');

        $.get(link, function(data)
        {
            DOM.find("#loading").remove();

            if(data['error'])
            {
                return alert(data['error_str']);
            }

            var b_link = $("#NextBLLink");

            if (data.comments.length > 0)
            {
                b_link.css('display', 'block');

                var html = [];

                for (var i in data.comments)
                {
                    var k = data.comments[i];

                    html.push('<div class="media" data-comment-id="'+k.id+'">');
                        html.push('<a class="media-left" href="'+k.user_link+'">');
                            html.push('<img class="media-object img-rounded" src="'+k.avatar+'" alt="'+k.fullname+'" width="52" height="52">');
                        html.push('</a>');

                        html.push('<div class="media-body media-body-level-1">');
                            html.push('<div class="panel panel-default">');
                                if(k.deleted == 0) {
                                    html.push('<div class="panel-heading">');
                                        html.push('<h4 class="media-heading pull-left"><a href="'+k.user_link+'">'+k.username+'</a></h4>');

                                        html.push('<div class="pull-right">');
                                            html.push('<small><span class="text-muted"><i class="fa fa-clock-o"></i>&nbsp;&nbsp;<time datetime="'+k.created_at.date+'" title="'+k.created_at.date+'"></time></span></small>&nbsp;&nbsp;');

                                            html.push('<div class="btn-group">');
                                                if(k.can_like) {
                                                html.push('<button onClick="javascript:Binh_Luan.like('+k.id+');" class="btn btn-xs btn-primary btn-like" type="button">');
                                                } else {
                                                html.push('<button class="btn btn-xs btn-primary disabled" type="button">');
                                                }
                                                    html.push('<i class="fa fa-thumbs-up"></i>');
                                                    html.push('<span>Thích</span>');
                                                html.push('</button>');

                                                if(k.can_like) {
                                                html.push('<button class="btn btn-xs btn-primary btn-like-addon" type="button">');
                                                } else {
                                                html.push('<button class="btn btn-xs btn-primary disabled" type="button">');
                                                }
                                                    html.push('<span class="likes">' + k.likes + '</span>');
                                                html.push('</button>');
                                            html.push('</div>');

                                            html.push('<a href="javascript:Binh_Luan.showFormAnswer('+k.id+');" class="btn btn-xs btn-primary" style="margin-left: 5px">Trả lời</a>');

                                            if(k.can_edit == 1) {
                                                html.push('<a href="javascript:Binh_Luan.showFormEdit('+k.id+');" class="btn btn-xs btn-primary" style="margin-left: 5px">Sửa</a>');
                                            }

                                            html.push('<div class="btn-group">');
                                                if(Binh_Luan.login) {
                                                    if(Binh_Luan.type == 'story') {
                                                        var reportUrl = base_url + '/truyen/' + Binh_Luan.slug + '/report-comment/' + k.id;
                                                    } else {
                                                        var reportUrl = base_url + '/chapter/' + Binh_Luan.key_binh_luan + '/report-comment/' + k.id;
                                                    }
                                                html.push('<a href="' + reportUrl + '" class="btn btn-xs btn-danger btn-report reportable-trigger" style="margin-left: 5px">Vi phạm</a>');
                                                } else {
                                                html.push('<a href="javascript:alert(\'Vui lòng đăng nhập để báo cáo vi phạm.\');" class="btn btn-xs btn-danger" style="margin-left: 5px">Vi phạm</a>');
                                                }

                                                html.push('<button class="btn btn-xs btn-danger btn-report-addon" type="button">');
                                                    html.push('<span class="reported">' + k.reported + '</span>');
                                                html.push('</button>');
                                            html.push('</div>');

                                            if(k.can_edit == 1) {
                                                html.push('<a href="javascript:Binh_Luan.delete('+k.id+');" class="btn btn-xs btn-danger btn-delete" style="margin-left: 5px">Xóa</a>');
                                            }
                                        html.push('</div>');

                                        html.push('<div class="clearfix"></div>');
                                    html.push('</div>');

                                    html.push('<div class="panel-body">');
                                        html.push('<span class="form-content">' + k.content + '</span>');

                                        html.push('<div class="text-right mt-5 form-edit" style="display: none; overflow: hidden;">');
                                            html.push('<textarea class="form-control mt-10 mb-10" maxlength="500"></textarea>');

                                            html.push('<div class="pull-right">');
                                                html.push('<button type="button" class="btn btn-sm btn-info btn-done" onClick="Binh_Luan.submitEdit('+k.id+');" data-loading-text="Đang lưu...">Xong</button>');
                                                html.push('<button type="button" class="btn btn-sm btn-danger" onClick="Binh_Luan.hiddenFormEdit('+k.id+');" style="margin-left: 5px">Hủy</button>');
                                            html.push('</div>');
                                        html.push('</div>');

                                        html.push('<div class="text-right mt-5 form-anwser" style="display: none; overflow: hidden;">');
                                            html.push('<textarea class="form-control mt-10 mb-10" maxlength="500"></textarea>');

                                            html.push('<div class="pull-right">');
                                                html.push('<button type="button" class="btn btn-sm btn-info" onClick="Binh_Luan.submit_answer('+k.id+');">Gửi trả lời</button>');
                                            html.push('</div>');
                                        html.push('</div>');
                                    html.push('</div>');
                                } else {
                                    html.push('<div class="alert alert-warning">Comment này đã bị xóa</div>');
                                }
                            html.push('</div>');

                            var childs = k.childs;

                            html.push('<div class="list-childs">');
                                if(childs.length > 0)
                                {
                                    for(var z in childs)
                                    {
                                        child = childs[z];

                                        html.push('<div class="media media-level-2" data-comment-id="'+child.id+'" data-child-id="'+child.id+'">');
                                            html.push('<a class="media-left" href="'+child.user_link+'">');
                                                html.push('<img class="media-object img-rounded" src="'+child.avatar+'" alt="'+child.fullname+'" width="52" height="52">');
                                            html.push('</a>');

                                            html.push('<div class="media-body media-body-level-2">');
                                                html.push('<div class="panel panel-default">');
                                                    if(child.deleted == 0) {
                                                        html.push('<div class="panel-heading">');
                                                            html.push('<h4 class="media-heading pull-left"><a href="'+child.user_link+'">'+child.username+'</a></h4>');

                                                            html.push('<div class="pull-right">');
                                                                html.push('<small><span class="text-muted"><i class="fa fa-clock-o"></i>&nbsp;&nbsp;<time datetime="'+child.created_at.date+'" title="'+child.created_at.date+'"></time></span></small>&nbsp;&nbsp;');

                                                                html.push('<div class="btn-group">');
                                                                    if(child.can_like) {
                                                                    html.push('<button onClick="javascript:Binh_Luan.like('+child.id+');" class="btn btn-xs btn-primary btn-like" type="button">');
                                                                    } else {
                                                                    html.push('<button class="btn btn-xs btn-primary disabled" type="button">');
                                                                    }
                                                                        html.push('<i class="fa fa-thumbs-up"></i>');
                                                                        html.push('<span>Thích</span>');
                                                                    html.push('</button>');

                                                                    if(child.can_like) {
                                                                    html.push('<button class="btn btn-xs btn-primary btn-like-addon" type="button">');
                                                                    } else {
                                                                    html.push('<button class="btn btn-xs btn-primary disabled" type="button">');
                                                                    }
                                                                        html.push('<span class="likes">' + child.likes + '</span>');
                                                                    html.push('</button>');
                                                                html.push('</div>');

                                                                if(child.can_edit == 1) {
                                                                    html.push('<a href="javascript:Binh_Luan.showFormEdit('+child.id+');" class="btn btn-xs btn-primary" style="margin-left: 5px">Sửa</a>');
                                                                }

                                                                html.push('<div class="btn-group">');
                                                                    if(Binh_Luan.login) {
                                                                        if(Binh_Luan.type == 'story') {
                                                                            var reportUrl = base_url + '/truyen/' + Binh_Luan.slug + '/report-comment/' + child.id;
                                                                        } else {
                                                                            var reportUrl = base_url + '/chapter/' + Binh_Luan.key_binh_luan + '/report-comment/' + child.id;
                                                                        }
                                                                    html.push('<a href="' + reportUrl + '" class="btn btn-xs btn-danger btn-report reportable-trigger" style="margin-left: 5px">Vi phạm</a>');
                                                                    } else {
                                                                    html.push('<a href="javascript:alert(\'Vui lòng đăng nhập để báo cáo vi phạm.\');" class="btn btn-xs btn-danger" style="margin-left: 5px">Vi phạm</a>');
                                                                    }

                                                                    html.push('<button class="btn btn-xs btn-danger btn-report-addon" type="button">');
                                                                        html.push('<span class="reported">' + child.reported + '</span>');
                                                                    html.push('</button>');
                                                                html.push('</div>');

                                                                if(child.can_edit == 1) {
                                                                    html.push('<a href="javascript:Binh_Luan.delete('+child.id+');" class="btn btn-xs btn-danger btn-delete" style="margin-left: 5px">Xóa</a>');
                                                                }
                                                            html.push('</div>');

                                                            html.push('<div class="clearfix"></div>');
                                                        html.push('</div>');

                                                        html.push('<div class="panel-body">');
                                                            html.push('<span class="form-content">' + child.content + '</span>');

                                                            html.push('<div class="text-right mt-5 form-edit" style="display: none; overflow: hidden;">');
                                                                html.push('<textarea class="form-control mt-10 mb-10" maxlength="500"></textarea>');

                                                                html.push('<div class="pull-right">');
                                                                    html.push('<button type="button" class="btn btn-sm btn-info btn-done" onClick="Binh_Luan.submitEdit('+child.id+');" data-loading-text="Đang lưu...">Xong</button>');
                                                                    html.push('<button type="button" class="btn btn-sm btn-danger" onClick="Binh_Luan.hiddenFormEdit('+child.id+');" style="margin-left: 5px">Hủy</button>');
                                                                html.push('</div>');
                                                            html.push('</div>');
                                                        html.push('</div>');
                                                    } else {
                                                        html.push('<div class="alert alert-warning">Comment này đã bị xóa</div>');
                                                    }
                                                html.push('</div>');
                                            html.push('</div>');
                                        html.push('</div>');
                                    }
                                }
                            html.push('</div>');
                        html.push('</div>');
                    html.push('</div>');
                }

                html = html.join('');

                DOM.append(html);

                $("time").each(function(t, e) {
                    var o = $(e).attr("datetime");
                    o && $(e).text(moment(o).fromNow())
                });

                $(".binh_luan_control").css('display', 'block');

                $('.reportable-trigger').magnificPopup({
                    type: 'ajax'
                });
            } else {
                b_link.css('display', 'none');

                if (trang == 1) {
                    DOM.append('<div class="text-center mt-10" id="comment-broadcast">Chưa có bình luận nào.</div>');

                    $(".binh_luan_control").css('display', 'none');
                } else {
                    DOM.append('<div class="text-center mt-10" id="comment-broadcast">Đã tải hết bình luận.</div>');

                    $(".binh_luan_control").css('display', 'none');
                }
            }

            return false;
        });
    },

    showFormAnswer: function(id){
        var DOM = $("[data-comment-id='"+id+"']").find('.form-anwser');

        DOM.slideToggle();

        window.setTimeout(function(){
            DOM.find('textarea').focus();
        }, 500);
    },

    hiddenFormAnswer: function(id){
        var DOM = $("[data-comment-id='"+id+"']").find('.form-anwser');

        DOM.slideUp();

        DOM.find('textarea').val('');
    },

    submit_answer: function(id){
        if(!Binh_Luan.login)
        {
            alert('Bạn phải đăng nhập trước khi gửi bình luận.');

            return false;
        }

        var template = '<div class="media media-level-2" data-child-id="[id]" data-comment-id="[id]">';
        template +=         '<a class="media-left" href="[user_link]">';
        template +=             '<img class="media-object img-rounded" src="[avatar]" alt="[fullname]" width="52" height="52">';
        template +=         '</a>';
        template +=         '<div class="media-body media-body-level-2">';
        template +=             '<div class="panel panel-default">';
        template +=                 '<div class="panel-heading">';
        template +=                     '<h4 class="media-heading pull-left">';
        template +=                         '<a href="[user_link]">[username]</a>';
        template +=                     '</h4>';
        template +=                     '<div class="pull-right">';
        template +=                         '<small><span class="text-muted"><i class="fa fa-clock-o"></i>&nbsp;&nbsp;<time datetime="[created_at]" title="[created_at]"></time></span></small>&nbsp;&nbsp;';
        template +=                         '<div class="btn-group">';
        template +=                             '<button onClick="javascript:Binh_Luan.like([id]);" class="btn btn-xs btn-primary btn-like" type="button">';
        template +=                                 '<i class="fa fa-thumbs-up"></i>';
        template +=                                 '<span>Thích</span>';
        template +=                             '</button>';
        template +=                             '<button class="btn btn-xs btn-primary btn-like-addon" type="button">';
        template +=                                 '<span class="likes">0</span>';
        template +=                             '</button>';
        template +=                         '</div>';
        template +=                         '<a href="javascript:Binh_Luan.showFormEdit([id]);" class="btn btn-xs btn-primary" style="margin-left: 5px">Sửa</a>';
        template +=                         '<div class="btn-group">';
        template +=                             '<a href="[reportUrl]" class="btn btn-xs btn-danger btn-report reportable-trigger" style="margin-left: 5px">Vi phạm</a>';
        template +=                             '<button class="btn btn-xs btn-danger btn-report-addon" type="button">';
        template +=                                 '<span class="reported">0</span>';
        template +=                             '</button>';
        template +=                         '</div>';
        template +=                         '<a href="javascript:Binh_Luan.delete([id]);" class="btn btn-xs btn-danger btn-delete" style="margin-left: 5px">Xóa</a>';
        template +=                     '</div>';
        template +=                     '<div class="clearfix"></div>';
        template +=                 '</div>';
        template +=                 '<div class="panel-body">';
        template +=                     '<span class="form-content">[content]</span>';
        template +=                     '<div class="text-right mt-5 form-edit" style="display: none; overflow: hidden;">';
        template +=                         '<textarea class="form-control mt-10 mb-10" maxlength="500"></textarea>';
        template +=                         '<div class="pull-right">';
        template +=                             '<button type="button" class="btn btn-sm btn-info btn-done" onClick="Binh_Luan.submitEdit([id]);" data-loading-text="Đang lưu...">Xong</button>';
        template +=                             '<button type="button" class="btn btn-sm btn-danger" onClick="Binh_Luan.hiddenFormEdit([id]);" style="margin-left: 5px">Hủy</button>';
        template +=                         '</div>';
        template +=                     '</div>';
        template +=                 '</div>';
        template +=             '</div>';
        template +=         '</div>';
        template +=     '</div>';

        var link = base_url + '/api/'+Binh_Luan.type+'/'+Binh_Luan.key_binh_luan+'/comment?child_id='+id;
        var DOM = $("[data-comment-id='"+id+"']");

        var container = DOM.find('.list-childs');

        container.prepend('<div class="text-center mt-10 mb-10" id="loading"><div class="ajax-loading"></div></div>');

        $.post(link, {
            'comment-content': DOM.find('.form-anwser textarea').val()
        }, function(data) {
            container.find("#loading").remove();

            if (data['error'])
            {
                return alert(data['error_str']);
            }

            Binh_Luan.hiddenFormAnswer(id);

            var k = data.comment;

            if(Binh_Luan.type == 'story') {
                var reportUrl = base_url + '/truyen/' + Binh_Luan.slug + '/report-comment/' + k.id;
            } else {
                var reportUrl = base_url + '/chapter/' + Binh_Luan.key_binh_luan + '/report-comment/' + k.id;
            }
            var html = template
                            .replaceAll('[user_link]', k.user_link)
                            .replaceAll('[fullname]', k.fullname)
                            .replaceAll('[username]', k.username)
                            .replaceAll('[avatar]', k.avatar)
                            .replaceAll('[content]', k.content)
                            .replaceAll('[created_at]', k.created_at.date)
                            .replaceAll('[id]', k.id)
                            .replaceAll('[reportUrl]', reportUrl);

            container.prepend(html);

            $("time").each(function(t, e) {
                var o = $(e).attr("datetime");
                o && $(e).text(moment(o).fromNow())
            });

            $('.reportable-trigger').magnificPopup({
                type: 'ajax'
            });

            return true;
        });
    },

    showFormEdit: function(id){
        var DOM = $("[data-comment-id='"+id+"']").find('.form-edit'),
            DOM_CONTENT = $("[data-comment-id='"+id+"']").find('.form-content');

        DOM.find('textarea').val(DOM_CONTENT.html());
        DOM.show();
        DOM_CONTENT.hide();

        window.setTimeout(function(){
            DOM.find('textarea').focus();
        }, 500);
    },

    hiddenFormEdit: function(id){
        var DOM = $("[data-comment-id='"+id+"']").find('.form-edit'),
            DOM_CONTENT = $("[data-comment-id='"+id+"']").find('.form-content');

        DOM.hide();
        DOM_CONTENT.html(DOM.find('textarea').val()).show();

        DOM.find('textarea').val('');
    },

    submitEdit: function(id) {
        var link = base_url + '/api/'+Binh_Luan.type+'/'+Binh_Luan.key_binh_luan+'/comment/' + id;
        DOM = $("[data-comment-id='"+id+"']").find('.form-edit'),

        DOM.find('.btn-done').button('loading');

        $.post(link, {
            'comment-content': DOM.find('textarea').val()
        }, function(data) {
            if (data['error']) {
                return alert(data['error_str']);
            } else {
                Binh_Luan.hiddenFormEdit(id);
            }

            DOM.find('.btn-done').button('reset');

            return true;
        });
    },

    like: function(id) {
        var link = base_url + '/api/'+Binh_Luan.type+'/'+Binh_Luan.key_binh_luan+'/like-comment/' + id,
            DOM = $("[data-comment-id='"+id+"']");

        $.post(link, {}, function(data) {
            if (data['error']) {
                alert(data['error_str']);
            } else {
                DOM.find('.likes').text(data['likes']);
                DOM.find('.btn-like, .btn-like-addon').addClass('disabled');
            }

            return true;
        });
    },

    delete: function(id) {
        if(confirm('Bạn có chắc muốn xóa comment này?')) {
            var link = base_url + '/api/'+Binh_Luan.type+'/'+Binh_Luan.key_binh_luan+'/delete-comment/' + id;

            $.post(link, {}, function(data) {
                if (data['error']) {
                    return alert(data['error_str']);
                } else {
                    $("#list-comments-media").html('');
                    Binh_Luan.load_binh_luan();
                }

                return true;
            });
        }
    }
};

// Sidebar comment
var SidebarComment = {
    page: 1,
    loadMore: function() {
        var self = this;

        $.ajax({
            url: base_url + '/api/comments/load_more?page=' + this.page,
            type: 'Get',
            dataType: 'Json',
            beforeSend: function() {
                $('#load-more-comment').addClass('hidden');
                $('.loading').removeClass('hidden');
            }
        }).done(function(response) {
            if(response.status == 'success') {
                var html = '';
                for(var key in response.data.comments) {
                    var comment = response.data.comments[key];

                    html += '<li class="list-group-item">';
                    html +=     '<h4 class="media-heading">' + comment.link + '</h4>';
                    html +=     '<p class="list-group-item-text" style="max-height: 100px; overflow: hidden">';
                    html +=         '<i class="fa fa-comment fa-fw text-muted"></i>';
                    html +=         comment.content;
                    html +=     '</p>';
                    html += '</li>';
                }

                $('.list-lastest-comments').append(html);

                if(!response.data.has_more) {
                    $('#load-more-comment').remove();
                }

                self.page++;
            }
        }).always(function(response) {
            $('#load-more-comment').removeClass('hidden');
            $('.loading').addClass('hidden');
        });
    }
}

// Replaces all instances of the given substring.
String.prototype.replaceAll = function(
strTarget, // The substring you want to replace
strSubString // The string you want to replace in.
){
var strText = this;
var intIndexOfMatch = strText.indexOf( strTarget );

// Keep looping while an instance of the target string
// still exists in the string.
while (intIndexOfMatch != -1){
// Relace out the current instance.
strText = strText.replace( strTarget, strSubString )

// Get the index of any next matching substring.
intIndexOfMatch = strText.indexOf( strTarget );
}

// Return the updated string with ALL the target strings
// replaced out with the new substring.
return( strText );
}