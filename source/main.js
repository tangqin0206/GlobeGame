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
//-----------------------------------------------------------------------------
/** @constructor */
function GlobeGame(gameData)
{
    /* State definitions
     0: Idle Mode intro
     1: Configuring Player
     2: Landmark Quiz
     3: Positioning Quiz
     4: Terminate show highscore
     */
    this.state = 0;
    this.qCount = 0;
    this.currentChallenge = null;
    this.gameData = gameData;
    this.callbacks = [];
    var that = this;
}

GlobeGame.prototype.Init = function()
{
    this.state = 1;
    var name = prompt(m_locale.entername, "Name");
    m_player = new Player(name);
    m_score = new ScoreCount(m_ui);
    this.currentChallenge = this.gameData.PickChallenge();
    this.InitQuiz();
};

GlobeGame.prototype.CycleCallback = function()
{
    for(var i = 0; i < this.callbacks.length; i++)
    {
        this.callbacks[i][1]();
    }
}

GlobeGame.prototype.InitQuiz = function()
{
    this.currentChallenge.Activate();
    /* if(challenge.type == 0)
     {
     this.state = 2;
     m_ui.setAlpha(0.0);
     }
     if(challenge.type == 1)
     {
     this.state = 3;
     }*/
};

GlobeGame.prototype.NextChallenge = function()
{
    if(this.gameData.questions.length > 0){
        this.currentChallenge = this.gameData.PickChallenge();
        this.InitQuiz();
    }
};

GlobeGame.prototype.RegisterCycleCallback = function(id, callback)
{
    this.callbacks.push([id,callback]);
}

GlobeGame.prototype.UnregisterCycleCallback = function(id)
{
    for(var i = 0; i < this.callbacks.length; i++)
    {
        if(this.callbacks[i][0] == id)
        {
            this.callbacks.splice(i,1);
        }
    }
}


//-----------------------------------------------------------------------------
/** @constructor */
function Player(name)
{
    this.playerName = name;
    this.playerScore = 0;
}

Player.prototype.ScorePoints = function(amount, description)
{
    var text = new FlyingText(m_static, "+"+amount+" "+m_locale.points+" "+ description, "#00FF00");
    this.playerScore += amount;
}

//-----------------------------------------------------------------------------
/** @constructor */
function GameData()
{
    // load question array
    this.questions = [];
    var that = this;
    jQuery.getJSON('../data/challenges_'+m_lang+'.json', function(data) {

        var items = [];

        jQuery.each(data, function(key, val) {
            if(val.Type == 0)
            {
                var challenge = new LandmarkChallenge(val.BaseScore, val.Options, val.CorrectOption, val.Views, val.Title);
                items.push(challenge);
            }else
            if(val.Type == 1)
            {
                var challenge = new PickingChallenge(val.BaseScore, val.Title);
                items.push(challenge);
            }

        });
        that.questions = items;
    });

}
GameData.prototype.PickChallenge = function()
{
    // Random pick a challenge
    var index = Math.floor(Math.random()*this.questions.length);
    var challenge = this.questions[index];
    this.questions.splice(index,1);
    return challenge;
};
//-----------------------------------------------------------------------------
/** @constructor */
function Challenge(type)
{
    /*
     0: Landmark question
     1: Positioning question
     */
    this.type = type;
    this.baseScore = 0;
    this.Activate = function() {};
    this.Destroy = function() {};
    this.OnDestroy = function() {};
}

//-----------------------------------------------------------------------------
/** @constructor */
function LandmarkChallenge(baseScore, options, correctOption, views, title)
{
    this.correctOption = correctOption;
    this.options = options;
    this.baseScore = baseScore;
    this.views = views;
    this.flystate = 1;
    this.text = title;
    this.stop = false;
    var buttonArray = [];
    var screenText = null;
    var clock = null;
    var that = this;
    this.onOption1 = function(){
        that.PickOption(1, clock.seconds);
    }
    this.onOption2 = function(){
        that.PickOption(2, clock.seconds);
    }
    this.onOption3 = function(){
       that.PickOption(3, clock.seconds);
    }
    this.onOption4 = function(){
        that.PickOption(4, clock.seconds);
    }
    this.Activate = function()
    {
        var btn1 = null;
        var btn2 = null;
        var btn3 = null;
        var btn4 = null;
        btn1 = new Button01(m_ui, "btn1", m_centerX-310, window.innerHeight-239, 300, 69, this.options[0], 15);
        btn1.onClickEvent = that.onOption1;
        btn2 = new Button01(m_ui, "btn2", m_centerX+10, window.innerHeight-239, 300, 69, this.options[1], 15);
        btn2.onClickEvent = that.onOption2;
        btn3 = new Button01(m_ui, "btn3", m_centerX-310, window.innerHeight-150, 300, 69, this.options[2], 15);
        btn3.onClickEvent = that.onOption3;
        btn4 = new Button01(m_ui, "btn4", m_centerX+10, window.innerHeight-150, 300, 69, this.options[3], 15);
        btn4.onClickEvent = that.onOption4;
        buttonArray.push(btn1);
        buttonArray.push(btn2);
        buttonArray.push(btn3);
        buttonArray.push(btn4);
        screenText = new ScreenText(m_ui, this.text,m_centerX, window.innerHeight-255, 20, "center");
        clock = new Clock(m_ui, 50, 75, 60);
        clock.Start();
        FadeIn(function() {});
        var flightduration = Math.floor(40/(views.length-1))*1000;
        var scene = ogGetScene(m_context);
        ogSetFlightDuration(scene,flightduration);
        var camId = ogGetActiveCamera(scene);
        ogSetPosition(camId,views[0].longitude,views[0].latitude, views[0].elevation);
        ogSetOrientation(camId,views[0].yaw,views[0].pitch, views[0].roll);
        ogSetInPositionFunction(m_context,that.FlightCallback);
        that.FlightCallback();

    }
    this.Destroy = function()
    {
        clock.Pause();
        that.stop = true;
        var scene = ogGetScene(m_context);
        ogStopFlyTo(scene);
        that.OnDestroy();
    }
    this.OnDestroy = function()
    {   clock.Destroy();
        FadeOut(function(){
            buttonArray[0].Destroy();
            buttonArray[1].Destroy();
            buttonArray[2].Destroy();
            buttonArray[3].Destroy();
            screenText.Destroy();
            if(m_game)
                m_game.NextChallenge();
        });
    };

    this.PickOption = function(option, timeleft)
    {
        buttonArray[0].setEnabled(false);
        buttonArray[1].setEnabled(false);
        buttonArray[2].setEnabled(false);
        buttonArray[3].setEnabled(false);
        if(that.correctOption == option)
        {
            m_player.ScorePoints(that.baseScore,"");
            m_player.ScorePoints(timeleft, m_locale.timebonus);
            if(timeleft > 50)
            {
                m_player.ScorePoints(20, m_locale.speedbonus);
            }
            buttonArray[option-1].setEnabled(true);
            buttonArray[option-1].setState(3);
            setTimeout(function(){that.Destroy();},2000);
        }else
        {
            buttonArray[option-1].setEnabled(true);
            buttonArray[that.correctOption-1].setEnabled(true);
            buttonArray[option-1].setState(4);
            buttonArray[that.correctOption-1].setState(5);
            setTimeout(function(){that.Destroy();},2000);
        }
    };
    this.FlightCallback = function()
    {
        if(that.stop != true && that.flystate-1 < that.views.length)
        {
            var oView = that.views[that.flystate];
            var scene = ogGetScene(m_context);
            that.flystate +=1;
            ogFlyTo(scene,oView.longitude,oView.latitude, oView.elevation,oView.yaw,oView.pitch,oView.roll);
        }
    };
}
LandmarkChallenge.prototype = new Challenge(0);
LandmarkChallenge.prototype.constructor=LandmarkChallenge;

//-----------------------------------------------------------------------------
/** @constructor */
function PickingChallenge(baseScore, title)
{
    this.screenText = null;
    this.text = title;
    var that = this;
    this.flystate = false;
    this.zoomState = false;
    this.pickPos = [];
    this.posPin = null;
    this.resultPin = null;
    this.line = null;
    this.distancText = null;

    this.Activate = function()
    {
        screenText = new ScreenText(m_ui, this.text,m_centerX, window.innerHeight-255, 20, "center");
        clock = new Clock(m_ui, 50, 75, 60);
        clock.Start();
        FadeIn(function() {});
        var scene = ogGetScene(m_context);
        var camId = ogGetActiveCamera(scene);
        ogSetPosition(camId,8.135578,46.948707, 326059.0);
        ogSetOrientation(camId,0.0,-90.0, 0.0);

        ogSetInPositionFunction(m_context,that.FlightCallback);
        m_stage.on("mousedown", this.OnMouseDown);
        m_stage.on("mouseup", this.OnMouseUp);
        m_stage.on("mousemove", this.OnMouseMove);
    };

    this.Destroy = function()
    {
        clock.Pause();
        var scene = ogGetScene(m_context);
        m_stage.on("mousedown", null);
        m_stage.on("mouseup", null);
        that.OnDestroy();
    };

    this.OnDestroy = function()
    {   clock.Destroy();
        FadeOut(function(){
            screenText.Destroy();
            if(m_game)
                m_game.NextChallenge();
        });
    };

    this.OnMouseDown = function()
    {
        var pos = m_stage.getMousePosition();
        var scene = ogGetScene(m_context);
        if(that.posPin)
        that.posPin.SetPos(pos.x-74, pos.y-132);
        if(that.flystate == true)
        {
            ogStopFlyTo(scene);
        }
        var ori = ogGetOrientation(scene);
        var result = ogPickGlobe(scene, pos.x-10, pos.y-10);
        that.ZoomIn(result, ori);
        if(that.posPin == null)
        {
            that.posPin = new Pin(m_ui, m_images.pin_blue, pos.x-74, pos.y-132);
        }
        that.zoomState = true;
    };

    this.OnMouseUp = function()
    {
        var scene = ogGetScene(m_context);
        that.zoomState = false;
        var pos = m_stage.getMousePosition();
        var mx = pos.x-10;
        var my = pos.y-10;
        that.pickPos = ogPickGlobe(scene, pos.x-10, pos.y-10);

        var NewPoiDefinition =
        {
            icon     : "http://www.openwebglobe.org/data/media/cycling.png",
            text 		: 	"",
            position :  [that.pickPos[1], that.pickPos[2], that.pickPos[3]+2000],
            size 		: 	200,
            flagpole : true
        };

        var poi = ogCreatePOI(m_poilayer,NewPoiDefinition);

        var result = ogPickGlobe(scene, mx, my);
        if (result[0])
        {
            //alert("pick result: lng=" + result[1] + ", lat=" + result[2] + ", elv=" + result[3]);
            console.log("picked at: [" + mx + ", " + my + "]");
             console.log("pick result: x=" + result[4] + ", y=" + result[5] + ", z=" + result[6]);
             var mouse = ogWorldToWindow(scene, result[4],result[5],result[6]);
             console.log("world to window = [" + mouse[0] + ", " + mouse[1] + ", " + mouse[2] + "]");

        }
        that.posPin.SetVisible(false);
        if(that.flystate == true)
        {
            ogStopFlyTo(scene);
        }

        that.ZoomOut();
    };

    this.OnMouseMove = function()
    {
        if(that.zoomState == true)
        {
            var pos = m_stage.getMousePosition();
            that.posPin.SetPos(pos.x-74, pos.y-132);
        }
    };

    this.ZoomIn = function(pos, ori)
    {
        that.flystate = true;
        var scene = ogGetScene(m_context);
        ogSetFlightDuration(scene,1000);
        ogFlyToLookAtPosition(scene,pos[1],pos[2], pos[3],70000,0.00,-90.0, 0.0);
    };

    this.ZoomOut = function(ori)
    {
        that.flystate = true;
        var scene = ogGetScene(m_context);
        ogSetFlightDuration(scene,800);
        ogFlyTo(scene,8.135578,46.948707, 326059.0,0.00,-90.0, 0.0);
    };

    this.FlightCallback = function()
    {
        that.flystate = false;
        var scene = ogGetScene(m_context);
        var pos = ogWorldToWindow(scene,that.pickPos[4],that.pickPos[5],that.pickPos[6]);
        that.posPin.SetVisible(true);
        that.posPin.SetPos(pos[0]-74+10, pos[1]-132+10);
    }
}
PickingChallenge.prototype = new Challenge(1);
PickingChallenge.prototype.constructor=PickingChallenge;

