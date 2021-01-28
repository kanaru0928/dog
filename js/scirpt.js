"use strict";

class Vec {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(b) {
        let a = this;
        return new Vec(a.x + b.x, a.y + b.y);
    }

    sub(b) {
        let a = this;
        return new Vec(a.x - b.x, a.y - b.y);
    }

    mul(s) {
        let a = this;
        return new Vec(a.x * s, a.y * s);
    }

    len() {
        return Math.sqrt(this.x ** 2 + this.y ** 2);
    }
}

class Seg {
    constructor(pos, way) {
        this.pos = pos;
        this.way = way;
    }

    static with2p(begin, end) {
        return new Seg(begin, end.sub(begin));
    }

    get begin() {
        return this.pos;
    }

    get end() {
        return this.pos.add(this.way);
    }

    get mid() {
        return this.pos.mul(0.5);
    }
}

class Rect {
    constructor(pos, size) {
        this.pos = pos;
        this.size = size;
    }
}

class Origin {
    static vec;
    static get x() {
        return this.vec.x;
    }
    static set x(val) {
        this.vec.x = val;
    }
    static get y() {
        return this.vec.y;
    }
    static set y(val) {
        this.vec.y = val;
    }
    static get bottom() {
        return (canvas.height - this.vec.y) / zoom;
    }
    static get top() {
        return -this.vec.y / zoom;
    }
    static get right() {
        return (canvas.width - this.vec.x) / zoom;
    }
    static get left() {
        return -this.vec.x / zoom;
    }
}

var canvas;
var ctx;
var zoom = 1;
var mode = 0;
var circle;
const BLOCK_SIZE = 16;
const ZOOM_MAX = 4;
const ZOOM_MIN = .3;
const AXIS_WEIGHT = .5;

function setCRadiusVal(val) {
    $("#c_radius_txt").val(val);
    $("#c_radius").val(val);
    draw();
}

function setRadiusVal(val) {
    $("#radius_txt").val(val);
    $("#radius").val(val);
    $("#height").attr("max", val * 2 - 1);
    $("#height_txt").attr("max", val * 2 - 1);
}

function setHeightVal(val) {
    $("#height_txt").val(val);
    $("#height").val(val);
}

function setAngleVal(val) {
    $("#angle_txt").val(val);
    $("#angle").val(val);
    draw();
}

function setLongVal(val) {
    $("#long").val(val);
    $("#long_txt").val(val);
    draw();
}

function onChangeSelect(obj) {
    let id = $(obj).attr("id");
    $(`#${id}`).addClass("selected");
    $(`.select_btn:not(#${id})`).removeClass("selected");
    $(".property_child").hide();
    $(`#${id.slice(0, -4)}`).show();
    switch (id) {
        case "circle_btn":
            mode = 0;
            break;
        case "sphere_btn":
            mode = 1;
            break;
        case "line_btn":
            mode = 2;
            break;
    }
    draw();
}

function zoomout() {
    if (zoom > ZOOM_MIN) {
        zoom -= 0.1;
        draw();
    }
}

function zoomin() {
    if (zoom < ZOOM_MAX) {
        zoom += 0.1;
        draw();
    }
}

function mouseEvent() {
    let pos = new Vec;
    let drag = new Vec;
    let flag = false;
    let oldOrigin;
    $("canvas").on("mousedown", function(e) {
        e.preventDefault();
        oldOrigin = Origin.vec;
        flag = true;
        pos.x = e.pageX;
        pos.y = e.pageY;
    });
    $("canvas").on("mousemove", function(e) {
        if (flag) {
            drag.x = e.pageX - pos.x;
            drag.y = e.pageY - pos.y;
            Origin.vec = oldOrigin.add(drag);
            draw();
        }
    });
    $(document).on("mouseup", function() {
        flag = false;
    });
    $(document).on("mouseleave", function(e) {
        e.preventDefault();
        flag = false;
    });
}

function doEvent() {
    // circle
    setCRadiusVal($("#c_radius").val());
    $("#c_radius").on("input", function() {
        setCRadiusVal($(this).val());
    });
    $("#c_radius_txt").on("chagne", function() {
        setCRadiusVal($(this).val());
    });

    // sphere
    setRadiusVal($("#radius").val());
    setHeightVal($("#height").val());
    $("#radius").on('input', function() {
        setRadiusVal($(this).val());
    });
    $("#radius_txt").on('change', function() {
        setRadiusVal($(this).val());
    });
    $("#height").on('input', function() {
        setHeightVal($(this).val());
    });
    $("#height_txt").on('change', function() {
        setHeightVal($(this).val());
    });
    $(".select_btn").on("click", function() {
        onChangeSelect(this);
    });

    // line
    setAngleVal($("#angle").val());
    setLongVal($("#long").val());
    $("#angle").on('input', function() {
        setAngleVal($(this).val());
    });
    $("#angle_txt").on('change', function() {
        setAngleVal($(this).val());
    });
    $("#long").on('input', function() {
        setLongVal($(this).val());
    });
    $("#long_txt").on('change', function() {
        setLongVal($(this).val());
    });


    // canvas
    let element = document.getElementById("main");

    element.addEventListener("wheel", function(event) {
        event.preventDefault();
        if (event.deltaY > 0) {
            zoomout();
        } else {
            zoomin();
        }
    }, { passive: false });

    $(window).resize(function() {
        initCanvasSize();
    });

    mouseEvent();
}

function drawLine(sX, sY, eX, eY) {
    ctx.beginPath();
    ctx.moveTo(sX, sY);
    ctx.lineTo(eX, eY);
    ctx.stroke();
}

function drawSeg(sX, sY, eX, eY) {
    let p1 = new Vec(sX, sY);
    let p2 = new Vec(eX, eY);
    let vec = Seg.with2p(p1, p2);
    vec.pos = vec.pos.mul(zoom).add(Origin.vec);
    vec.way = vec.way.mul(zoom);
    drawLine(vec.begin.x, vec.begin.y, vec.end.x, vec.end.y);
}

function drawAxis() {
    let a = -AXIS_WEIGHT / (ZOOM_MIN - 1 - 1) / (ZOOM_MIN - 1 - ZOOM_MAX);
    let f = a * (zoom - 1) * (zoom - ZOOM_MAX) + AXIS_WEIGHT;
    ctx.lineWidth = Math.min(AXIS_WEIGHT, f);
    ctx.beginPath();
    let x, y;
    let margin = BLOCK_SIZE;
    for (let i = 0; i < Math.ceil(canvas.height / (margin * zoom)); i++) {
        y = i * margin * zoom + Origin.y % (margin * zoom);
        drawLine(0, y, canvas.width, y);
    }
    for (let i = 0; i < Math.ceil(canvas.width / (margin * zoom)); i++) {
        x = i * margin * zoom + Origin.x % (margin * zoom);
        drawLine(x, 0, x, canvas.height);
    }
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 1.5;
    drawSeg(Origin.left, BLOCK_SIZE / 2, Origin.right, BLOCK_SIZE / 2);
    ctx.strokeStyle = '#0000ff';
    drawSeg(BLOCK_SIZE / 2, Origin.top, BLOCK_SIZE / 2, Origin.bottom);
}

function drawRect(x, y, h, w) {
    // console.log(x, y, h, w);
    let pos = new Vec(x, y);
    let size = new Vec(h, w);
    let rect = new Rect(pos, size);
    rect.pos = rect.pos.mul(zoom).add(Origin.vec);
    rect.size = rect.size.mul(zoom);
    ctx.fillRect(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y);
}

function drawInit() {
    ctx.strokeStyle = 'gray';
    drawAxis();
}

function drawBlock(x, y) {
    drawRect(x * (BLOCK_SIZE), y * (BLOCK_SIZE), BLOCK_SIZE, BLOCK_SIZE);
}

function drawCircle() {
    let d;
    let xcode, ycode;
    let r = $("#c_radius").val();
    r -= 1;
    let rsin45 = Math.sin(Math.PI / 4) * r + 1;
    ctx.fillStyle = "dimgray";
    for (let i = 0; i <= rsin45; i++) {
        d = Math.round(Math.sqrt(r ** 2 - i ** 2));
        for (let j = 0; j < 2; j++) {
            xcode = j * 2 - 1;
            for (let k = 0; k < 2; k++) {
                ycode = k * 2 - 1;
                drawBlock(i * xcode, d * ycode);
                drawBlock(d * ycode, i * xcode);
            }
        }
    }

}

function drawBlockLine() {
    let angle = Math.PI / 180 * $("#angle_txt").val();
    let r = $("#long_txt").val();
    //if (angle == Math.PI / 2);
    if (angle <= Math.PI / 4 || angle > Math.PI / 4 * 3) {
        let x = Math.ceil(r * Math.cos(angle));
        let isXPositive = x >= 0;
        for (let i = 0; Math.abs(i) < Math.abs(x); isXPositive ? i++ : i--) {
            drawBlock(i, -Math.round(i * Math.tan(angle)));
            drawBlock(-i, Math.round(i * Math.tan(angle)));
        }
    } else {
        let y = Math.ceil(r * Math.sin(angle));
        console.log(y);
        let isYPositive = y >= 0;
        for (let i = 0; Math.abs(i) < Math.abs(y); isYPositive ? i++ : i--) {
            drawBlock(Math.round(i / Math.tan(angle)), -i);
            drawBlock(-Math.round(i / Math.tan(angle)), i);
        }
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    switch (mode) {
        case 0:
            drawCircle();
            break;
        case 2:
            drawBlockLine();
    }
    drawInit();
}

function initCanvasSize() {
    canvas.width = $("canvas").width();
    canvas.height = $("canvas").height();
    Origin.vec = new Vec(canvas.width / 2, canvas.height / 2);
    draw();
}

$(function() {
    canvas = document.getElementById('main');
    if (canvas.getContext) {
        ctx = canvas.getContext('2d');
        initCanvasSize();
        doEvent();
    }
});