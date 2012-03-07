/*******************************************************************************
#      ____               __          __  _      _____ _       _               #
#     / __ \              \ \        / / | |    / ____| |     | |              #
#    | |  | |_ __   ___ _ __ \  /\  / /__| |__ | |  __| | ___ | |__   ___      #
#    | |  | | '_ \ / _ \ '_ \ \/  \/ / _ \ '_ \| | |_ | |/ _ \| '_ \ / _ \     #
#    | |__| | |_) |  __/ | | \  /\  /  __/ |_) | |__| | | (_) | |_) |  __/     #
#     \____/| .__/ \___|_| |_|\/  \/ \___|_.__/ \_____|_|\___/|_.__/ \___|     #
#           | |                                                                #
#           |_|                 _____ _____  _  __                             #
#                              / ____|  __ \| |/ /                             #
#                             | (___ | |  | | ' /                              #
#                              \___ \| |  | |  <                               #
#                              ____) | |__| | . \                              #
#                             |_____/|_____/|_|\_\                             #
#                                                                              #
#                              (c) 2011-2012 by                                #
#           University of Applied Sciences Northwestern Switzerland            #
#                     Institute of Geomatics Engineering                       #
#                          Author:robert.wst@gmail.com                         #
********************************************************************************
*     Licensed under MIT License. Read the file LICENSE for more information   *
*******************************************************************************/
/* GUI Elements */
goog.provide('owg.gg.Button01');
goog.provide('owg.gg.MessageDialog');
goog.provide('owg.gg.ScreenText');
goog.provide('owg.gg.Pin');
goog.provide('owg.gg.Clock');
goog.provide('owg.gg.ScoreCount');
//-----------------------------------------------------------------------------
/**
 * @class Button01
 * @constructor
 *
 * @description default button class native 300 x 69 pixel
 *
 * @author Robert Wüest robert.wst@gmail.ch
 *
 * @param {Object} layer
 * @param {string} name
 * @param {number} x
 * @param {number} y
 * @param {number} width
 * @param {number} height
 * @param {string} caption
 * @param {number} fontsize
 */
function Button01(layer, name, x, y, width, height, caption, fontsize)
{
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.state = 0;
    this.caption = caption;
    this.fontsize = fontsize;
    this.name = name;
    this.enabled = true;
    this.layer = layer;

    this.onClickEvent = function() {};
    this.onMouseOverEvent = function() {};
    this.onMouseOutEvent = function() {};
    this.onMouseDownEvent = function() {};
    this.onMouseUpEvent = function() {};
    var that = this;

    this.shape = new Kinetic.Shape({drawFunc:function(){
        var ctx = this.getContext();
        var clickOffset = 0;
        if(that.enabled == false)
        {
            ctx.drawImage(m_images["btn_01_d"], x, y, width, height);
        }
        else if(that.state == 0)
        {
            ctx.drawImage(m_images["btn_01"], x, y, width, height);
        }
        else if(that.state == 1)
        {
            ctx.drawImage(m_images["btn_01_h"], x, y, width, height);
        }
        else if(that.state == 2)
        {
            ctx.drawImage(m_images["btn_01_c"], x, y, width, height);
            clickOffset = 2;
        }
        else if(that.state == 3)
        {
            ctx.drawImage(m_images["btn_01_t"], x, y, width, height);
        }
        else if(that.state == 4)
        {
            ctx.drawImage(m_images["btn_01_f"], x, y, width, height);
        }
        else if(that.state == 5)
        {
            ctx.drawImage(m_images["btn_01_o"], x, y, width, height);
        }
        ctx.beginPath();
        ctx.rect(x, y, width, height);
        ctx.closePath();
        ctx.font = fontsize+"pt TitanOne";
        ctx.fillStyle = "#FFF";
        var textWidth = ctx.measureText(that.caption).width;
        var textHeight = ctx.measureText(that.caption).height;
        var tX = x+clickOffset;
        var tY = y+ 3*(height/5)+clickOffset;
        if(textWidth <= width)
        {
            tX = x + ((width-textWidth)/2);
        }
        ctx.fillText(that.caption, tX, tY);
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000"; // stroke color
        ctx.strokeText(that.caption, tX, tY);
    }});

    this.shape.on("mouseout", function(){
        that.onMouseOutEvent();
        if(that.state < 3)
        {that.state = 0;}
    });
    this.shape.on("mouseover", function(){
        that.onMouseOverEvent();
        if(that.state < 3)
        {that.state = 1;}
    });
    this.shape.on("mousedown", function(){
        that.onMouseDownEvent();
        if(that.state < 3)
        {that.state = 2;}

    });
    this.shape.on("mouseup", function(){
        that.onMouseUpEvent();
        if(that.state < 3)
        {that.state = 1;
        that.onClickEvent();
        }
    });
    this.shape.name = name;
    layer.add(this.shape);
}
//-----------------------------------------------------------------------------
/**
 * @description change enable state
 * @param {boolean} enabled
 */
Button01.prototype.SetEnabled = function(enabled)
{
    this.enabled = enabled;
};
//-----------------------------------------------------------------------------
/**
 * @description change state
 * @param {number} state
 */
Button01.prototype.SetState = function(state)
{
    this.state = state;
};
//-----------------------------------------------------------------------------
/**
 * @description destroy button
 */
Button01.prototype.Destroy = function()
{
    this.layer.remove(this.shape);
};

goog.exportSymbol('Button01', Button01);
goog.exportProperty(Button01.prototype, 'SetEnabled', Button01.prototype.SetEnabled);
goog.exportProperty(Button01.prototype, 'SetState', Button01.prototype.SetState);
goog.exportProperty(Button01.prototype, 'Destroy', Button01.prototype.Destroy);
//-----------------------------------------------------------------------------
/**
 * @class Clock
 * @constructor
 *
 * @description draw a timer widget for countdown (max 60 seconds)
 *
 * @author Robert Wüest robert.wst@gmail.ch
 *
 * @param {Object} layer
 * @param {number} x
 * @param {number} y
 * @param {number} seconds
 */
function Clock(layer, x, y, seconds)
{
    this.layer = layer;
    this.x = x;
    this.y = y;
    this.seconds = seconds;
    this.visible = true;
    this.obsolete = false;
    var unit = 2.0/60;
    var that = this;
    this.running = false;
    this.onTimeoutEvent = function() {};

    this.shape = new Kinetic.Shape({drawFunc:function(){

        if(that.visible == true)
        {
            var ctx = this.getContext();
            var pos = unit*that.seconds-0.5;
            ctx.drawImage(m_images["clock"], x, y, 220, 260);
            ctx.beginPath();
            ctx.arc(x+110, y+153, 84, pos*Math.PI, 1.5*Math.PI, false);
            ctx.lineTo(x+110, y+153);
            ctx.closePath();
            var pattern = ctx.createPattern(m_images["dial"], "no-repeat");
            ctx.fillStyle = pattern;
            ctx.translate(x+25, y+65);
            ctx.fill();
            if(that.seconds > 10) {ctx.fillStyle = "#FFF";} else {ctx.fillStyle = "#F00";}
            ctx.font = "40pt TitanOne";
            ctx.textAlign = "center";
            var secs = "" +that.seconds;
            ctx.fillText(secs, 85, 110);
            ctx.lineWidth = 3;
            ctx.strokeStyle = "#000"; // stroke color
            ctx.strokeText(secs, 85, 110);
        }
    }});
    layer.add(this.shape);
};
//-----------------------------------------------------------------------------
/**
 * @description start timer
 */
Clock.prototype.Start = function()
{
    this.running = true;
    this.Countdown();
};
//-----------------------------------------------------------------------------
/**
 * @description pause timer
 */
Clock.prototype.Pause = function()
{
    this.running = false;
};
//-----------------------------------------------------------------------------
/**
 * @description resume timer
 */
Clock.prototype.Resume = function()
{
    this.running = true;
};
//-----------------------------------------------------------------------------
/**
 * @description recurring countdown function
 */
Clock.prototype.Countdown = function()
{
    var that = this;
    setTimeout(function(){
        if(that.obsolete == true)
        {

        }
        else if(that.seconds > 0)
        {that.Countdown();}
        else
        {
            that.running = false;
            that.onTimeoutEvent(); }
    }, 1000);
    if(this.running)
    {
        this.seconds = this.seconds -1;
    }
};
//-----------------------------------------------------------------------------
/**
 * @description destroy clock
 */
Clock.prototype.Destroy = function()
{
    this.obsolete = true;
    this.OnDestroy();
};
//-----------------------------------------------------------------------------
/**
 * @description on destroy function
 */
Clock.prototype.OnDestroy = function()
{
    this.layer.remove(this.shape);
};
//-----------------------------------------------------------------------------
/**
 * @description show/hide timer
 */
Clock.prototype.SetVisible = function(visible)
{
    this.visible = visible;
};
//-----------------------------------------------------------------------------
/**
 * @description get current value of the timer
 * @return {number} seconds
 */
Clock.prototype.GetSeconds = function()
{
    return this.seconds;
};
goog.exportSymbol('Clock', Clock);
goog.exportProperty(Clock.prototype, 'Start', Clock.prototype.Start);
goog.exportProperty(Clock.prototype, 'Pause', Clock.prototype.Pause);
goog.exportProperty(Clock.prototype, 'Resume', Clock.prototype.Resume);
goog.exportProperty(Clock.prototype, 'Countdown', Clock.prototype.Countdown);
goog.exportProperty(Clock.prototype, 'Destroy', Clock.prototype.Destroy);
goog.exportProperty(Clock.prototype, 'OnDestroy', Clock.prototype.OnDestroy);
goog.exportProperty(Clock.prototype, 'SetVisible', Clock.prototype.SetVisible);
goog.exportProperty(Clock.prototype, 'GetSeconds', Clock.prototype.GetSeconds);
//-----------------------------------------------------------------------------
/**
 * @class ScreenText
 * @constructor
 *
 * @description draw text on the screen
 *
 * @author Robert Wüest robert.wst@gmail.ch
 *
 * @param {Object} layer
 * @param {string} text
 * @param {number} x
 * @param {number} y
 * @param {number} fontsize
 * @param {string} align
 */
function ScreenText(layer, text, x, y, fontsize, align)
{
    this.text = text;
    this.x = x;
    this.y = y;
    this.fontsize = fontsize;
    this.align = align;
    this.layer = layer;
    var that = this;

    this.shape = new Kinetic.Shape({drawFunc:function(){
        var ctx = this.getContext();
        ctx.textAlign = that.align;
        ctx.fillStyle = "#FFF";
        ctx.font = that.fontsize+"pt TitanOne";
        ctx.textAlign = that.align;
        ctx.fillText(that.text, that.x, that.y);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000"; // stroke color
        ctx.strokeText(that.text,  that.x, that.y);
    }});
    layer.add(this.shape);
}

//-----------------------------------------------------------------------------
/**
 * @description Destroy screen text
 */
ScreenText.prototype.Destroy = function()
{
    this.layer.remove(this.shape);
};
goog.exportSymbol('ScreenText', ScreenText);
goog.exportProperty(ScreenText.prototype, 'Destroy', ScreenText.prototype.Destroy);
//-----------------------------------------------------------------------------
/**
 * @class MessageDialog
 * @constructor
 *
 * @description draw text on the screen
 *
 * @author Robert Wüest robert.wst@gmail.ch
 *
 * @param {Object} layer
 * @param {string} message
 * @param {number} width
 * @param {number} height
 */
function MessageDialog(layer, message, width, height)
{
    this.message = message;
    this.layer = layer;
    this.okayButton = null;
    var that = this;

    /** Inline Functions */
    this.Callback = function(){};
    this.OnOkay = function()
    {
        that.Destroy();
        that.Callback();
    };

    this.shape = new Kinetic.Shape({drawFunc:function(){
        var ctx = this.getContext();
        ctx.beginPath();
        ctx.rect((window.innerWidth/2)-(width/2), (window.innerHeight/2)-(height/2), width, height);
        var grad = ctx.createLinearGradient(window.innerWidth/2, (window.innerHeight/2)-(height/2), window.innerWidth/2, (window.innerHeight/2)+(height/2));
        grad.addColorStop(0, "#555"); // light blue
        grad.addColorStop(1, "#CCC"); // dark blue
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#FFF";
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFF";
        ctx.font = "18pt TitanOne";
        ctx.textAlign = "center";
        ctx.fillText(that.message, window.innerWidth/2, window.innerHeight/2-(height/2)+80);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000"; // stroke color
        ctx.strokeText(that.message, window.innerWidth/2, window.innerHeight/2-(height/2)+80);

    }});
    layer.add(this.shape);
    this.okayButton = new Button01(m_ui, "dialog", window.innerWidth/2-150, window.innerHeight/2+(height/2)-100, 300, 69, "OK", 15);
    this.okayButton.onClickEvent = this.OnOkay;

}
//-----------------------------------------------------------------------------
/**
 * @description define callbackfunction when hit okay
 * @param {function()} callback
 */
MessageDialog.prototype.RegisterCallback = function(callback)
{
    this.Callback = callback;
};
//-----------------------------------------------------------------------------
/**
 * @description destroy the dialog
 */
MessageDialog.prototype.Destroy = function()
{
    this.layer.remove(this.shape);
    this.layer.remove(this.okayButton.shape);
};
goog.exportSymbol('MessageDialog', MessageDialog);
goog.exportProperty(MessageDialog.prototype, 'RegisterCallback', MessageDialog.prototype.RegisterCallback);
goog.exportProperty(MessageDialog.prototype, 'Destroy', MessageDialog.prototype.Destroy);
//-----------------------------------------------------------------------------
/**
 * @class ScoreCount
 * @constructor
 *
 * @description draw scorecount widget
 *
 * @author Robert Wüest robert.wst@gmail.ch
 *
 * @param {Object} layer
 */
function ScoreCount(layer)
{
    this.layer = layer;
    var that = this;

    this.shape = new Kinetic.Shape({drawFunc:function(){
        var ctx = this.getContext();
        ctx.beginPath();
        ctx.rect(10, 10, 225, 50);
        var grad = ctx.createLinearGradient(10, 10, 10, 50);
        grad.addColorStop(0, "#555");
        grad.addColorStop(1, "#CCC");
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.lineWidth = 3;
        ctx.strokeStyle = "#FFF";
        ctx.stroke();
        ctx.textAlign = "center";
        ctx.fillStyle = "#FFF";
        ctx.font = "16pt TitanOne";
        ctx.textAlign = "left";
        ctx.fillText(m_locale["score"]+": "+m_player.playerScore, 25, 45);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#000"; // stroke color
        ctx.strokeText(m_locale["score"]+": "+m_player.playerScore, 25, 45);

    }});
    layer.add(this.shape);
}

//-----------------------------------------------------------------------------
/**
 * @description destroy the widget
 */
ScoreCount.prototype.Destroy = function()
{
    this.layer.remove(this.shape);
}
goog.exportSymbol('ScoreCount', ScoreCount);
goog.exportProperty(ScoreCount.prototype, 'Destroy', ScoreCount.prototype.Destroy);
//-----------------------------------------------------------------------------
/**
 * @class Pin
 * @constructor
 *
 * @description draw positioning pin
 *
 * @author Robert Wüest robert.wst@gmail.ch
 *
 * @param {Object} layer
 * @param {Element} image
 * @param {number} x
 * @param {number} y
 */
function Pin(layer, image, x, y)
{
    this.layer = layer;
    var that = this;
    this.x = x;
    this.y = y;
    this.visible = true;

    this.shape = new Kinetic.Shape({drawFunc:function(){
        if(that.visible == true)
        {
            var ctx = this.getContext();
            ctx.beginPath();
            ctx.drawImage(image, that.x-74, that.y-132, 86, 144);
        }

    }});
    layer.add(this.shape);
}

//-----------------------------------------------------------------------------
/**
 * @description set pin position
 * @param {number} x
 * @param {number} y
 */
Pin.prototype.SetPos = function(x,y)
{
    this.x = x;
    this.y = y;
}

//-----------------------------------------------------------------------------
/**
 * @description set pin position
 * @param {boolean} visible
 */
Pin.prototype.SetVisible = function(visible)
{
    this.visible = visible;
}
//-----------------------------------------------------------------------------
/**
 * @description destroy pin
 */
Pin.prototype.Destroy = function()
{
    this.layer.remove(this.shape);
}
goog.exportSymbol('Pin', Pin);
goog.exportProperty(Pin.prototype, 'SetPos', Pin.prototype.SetPos);
goog.exportProperty(Pin.prototype, 'SetVisible', Pin.prototype.SetVisible);
goog.exportProperty(Pin.prototype, 'Destroy', Pin.prototype.Destroy);