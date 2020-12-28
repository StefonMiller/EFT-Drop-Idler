URL = '';
URLs = [];

//Create listener to initialize plugin when it is re-enabled
chrome.management.onEnabled.addListener(function()
{
    initializePlugin();
});

//Initialize plugin on installation
chrome.runtime.onInstalled.addListener(function() 
{
    initializePlugin();
});


//Set a routine to run every 30 minutes
chrome.alarms.create("1min", {
    delayInMinutes: 1,
    periodInMinutes: 1
  });
  
  chrome.alarms.onAlarm.addListener(function(alarm) 
  {
    
    if (alarm.name === "1min") 
    {
        //Get all currently opened tabs
        getTabs().then(
            function(tbs)
            {

                //Loop through each tab, and check if any of them are the current stream we are supposed to have open
                outer: for(i = 0; i < tbs.length; i++)
                {
                    //There should never be an error here, but in case there is just re initialize the plugin
                    try
                    {
                        console.log("URL is " + url);
                        for(j = 0; j < URLs.length; j++)
                        {
                            //If the tab we are supposed to have open is still running, close it.
                            if(tbs[i].url === URLs[j])
                            {
                                console.log("Found match, closing tab..")
                                chrome.tabs.remove(tbs[i].id, function() { });
                            }
                        }
                        
                    }
                    catch(e)
                    {
                        console.log(e);
                        break outer;
                    }
                }
                //After checking if the tab was open, open a new one. This way there will only be 1 stream tab opened by the extension at once
                initializePlugin();
            })
        
    }

    
  });

function initializePlugin()
{
    //During this event, the time at which new streams have drops enabled is in MSK, so we must use that time when 
    //determining what time it currently is. Additionally, the time streams switch is at 12:00 MSK so we have to 
    //keep the date 1 behind until then.
    var today = new Date().toLocaleString("ru-RU", {timeZone: "Europe/Moscow"});
    totalArgs = today.split(',');
    timeArgs = totalArgs[1].split(':');
    dateArgs = totalArgs[0].split('.');
    day = parseInt(dateArgs[0]);
    month = parseInt(dateArgs[1]);
    year = parseInt(dateArgs[2]);
    hour = parseInt(timeArgs[0]);

    console.log("HERE");

    if(hour < 12)
    {
        console.log("Not 12 MSK yet, keeping day from incrementing...");
        day--;
    }
    if((month == 12 || month == 1) && (year == 2020 || year == 2021)) 
    {
        console.log("Date is " + month, day, year, hour);
        channels = getStreams(day);
        if(channels == "")
        {
            console.log("No drops for today.");
        }
        else
        {
            genToken(channels, checkOnline);
        }
    }
}

//Get all tabs currently opened
function getTabs()
{
    return new Promise(function(resolve, reject){
        chrome.tabs.query({}, function(tabs) {
          resolve(tabs);
        });
      });
}

//Create stream url
function openStream(channelName)
{
    url = "https://www.twitch.tv/" + channelName;
    if(!URLs.includes(url))
    {
        URLs.push(url);
    }
    console.log(URLs);
    newTab(url);
}

//Get the first stream in the list of streams that have drops enabled for the current day
function getFirstStream(streams, channels)
{
    outer: 
        for(i = 0; i < streams.length; i++)
        {
            for(j = 0; j < channels.length; j++)
            {
                name = streams[i].user_name.toLowerCase()
                if(name === channels[j])
                {
                    break outer;
                }
            }
        }
    openStream(name);
}

//Get the OAuth token from the twitch API
function genToken(channels, callback)
{
    var token;
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://id.twitch.tv/oauth2/token?client_id=1swbh92vaxjly24it3cd07xc0du1e4&client_secret=7b0op63c2799ivqnx3ttfxeh2na2dz&grant_type=client_credentials", true);
    xhr.send();
    xhr.onload = function() 
    {
        responseObj = xhr.response;
        jsonData = JSON.parse(responseObj);
        token = jsonData.access_token;
        callback(channels, token);
    };
}

//Get a list of the top 100 tarkov streams
function checkOnline(channels, token)
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "https://api.twitch.tv/helix/streams?game_id=491931", true);
    xhr.setRequestHeader('Client-ID', '1swbh92vaxjly24it3cd07xc0du1e4');
    xhr.setRequestHeader('Authorization', "Bearer " + token);
    xhr.send();
    xhr.onload = function() {
        let responseObj = xhr.responseText;
        jsonData = JSON.parse(responseObj);
        streams = jsonData.data;
        getFirstStream(streams, channels);
    };

    

}

//Open a url in a new tab. Opens tab in the background so the browser isn't constantly interrupted when we close&open a tab
function newTab(url)
{   
    getTabs().then(
        function(tbs)
        {
            var flag = false;
            //Loop through each tab, and check if any of them are the current stream we are supposed to have open
            for(i = 0; i < tbs.length; i++)
            {
                //If the tab we are supposed to have open is still running, close it.
                if(tbs[i].url === url)
                {
                    console.log("Duplicate tab found, not creating an additional one...")
                    flag = true;
                }
            }
            //If the tab was not already opened, open it.
            if(!flag)
            {
                chrome.tabs.create({url: url, active: false});
                console.log("Setting new tab to " + url)
            }
        })
}

//Return the list of streamers with drops enabled for the corresponding day
function getStreams(day)
{
    switch(day)
    {
    case 1:
        return [
            'leonnzera','ghostfreak66','kangaroo_op','philbo','party__pineapple','patosh','iAlexuni',
            'buldrelive','sneakyru007','piercetheprofessional','worrun_','furl3x','weekey94','baddie',
            'MissMarj','geekseh','Talina','tsm_aimpr','generalsam123','damnitbennett','Goesmau5','pepp',
            'irokezzina','jessekazam','likeahero','iredseven','walkr6','irina_shoroh','robn','viibiin','skuuii',
            'alienato90','Krede','exfilcamper','linzical','Hornisse86','hitujiha','coldfr4me','CrossFireX','omidlive',
            'marcoopz','hanstory','burcay','optimusbananas','logicalsolutions','kazimirtv','haematl','claymore_plays','onepeg','professorbroman'];
    case 2:
        return [ 
            'hungoverakorn','t1ptap_tv','crosspaladinofb','blitzergirl','senseiscav','kritikal','4fungamingg',
            'f1ashko','prophet_fmj','noiceguy','vinylblade','bibixhd','alconafter','sigma','Craysin','Kira',
            'enerfunk','withoutaim','welyn','damasta9','mrjgamer51','icelandicgamergirl','mr_holodos','cohhcarnage',
            'prefireztv','maihopawango','SscorpionN__','ANOOONE','Gotcha','thereeferraptor','pik_tv','M1NDR','anna_mojo',
            'SomeMan','youngrosay','derb_herb','dicklet_','gopster_','Ph0bes','pro_kesadia','SubJect8','cashnalot','raufbaba25',
            'ArtemisKnives','blazedlsmurf','oskurogg','losiugra','glitzyphoenix','resttpowered'];
    case 3:
        return [
            'icelaptop','madlman','yoowooyang','maramoshta','Austin_Bean','mrdrakezilla','evrzhy','Kippenbro','tigzp',
            'fairlight_excalibur','maplesyrupjunkie','shaskatv','tube404','anton','fishpastee','Frolicer','bidondx','damieee',
            'grimmmz','AFFLiC','rik_leah','leinadcaza','queenjilicious','breakinskullz','bakedjakettv','whiteydude','kriszhadvice',
            'fairtx','nickbunyun','xblazxd','Daytona5051','dre3dd','beastqt','nofoodaftermidnight','danbergundy','askara','giornogaming',
            'maza4kst','mightygaming','deadpine','LivinsEZ','larae94','bullseye','frost_','yoryi88','playerjp_','voroshka','tsm_viss',
            'NemerethTV','n41ru','LeaDoXo','FinestXI'];
    case 4:
        return [
            'professor_akimbox','wollow_313','5ithug5','garbagemannn','kusqt','vox_e','wackyjacky101','bakeezy','o_smurf_o',
            'aethos','mrfalll','nepzukka','cemka','Shanksy','evasion_gg','Alpha__Alien','thiibz976','ulqi','5MTH','sheefgg',
            'ultimatekc_','KhOyATv','sheriff_live','markstrom','razzledis','ms_nyxia','headleyy','insize','cloakzy','jeepotv',
            'bobek_zklobouku','ryzme','wbexp','gingerliness','desmondpilak','moondye7','tamatthi','shnumi','theAtlasfamily','sgtwoofy',
            'MoinSunny','einherjarskf','hypergl','thedevildoggamer','rawryy','SaltyLeon','nohandsnz','f4tr4t_ttv','RedVox'];
    case 5:
        return [
            'ghostthellama','sherpahub','wiciu_ck','UncivilizationTV','SoberTTV','redopz','myst1s','gilcamilotti','mratomicduck',
            'mvg_hells','peeknduck_','as2pik','jhnro','BoxyM3','kaptainkayy','JotaSX','mcgugu','makatao','smoke','papapoob',
            'deadlyslob','Nwashi','theblindshogun','sharptooth','rhadamant5186','TheMotivation','sixquatre','kasyascherbakov',
            'arsyntv','zearhok','kaymind','cucu0015','sharap','destinysin666','swagger','totallyacro','fantasy1800','PashaFreeman',
            'hyperrattv','skaavtv','bubbles_ie','etojemaloy','eazyshot7','lauter95','znorux','dejavushothd','dogo','cheeki_scav','fukzo0',
            'marhtern','cazzler'];
    case 6:
        return [
            'train__','acid_fired','animaleeeeeeeeee','ussralexeybatya','mad_ruski','tezmate','SuWu84','Dangereesk','1n1ck','Al_Smizzle',
            'Behatche','kiwyxtreme','Sk4R_jp','raccoonzzel','silentsentry','weplaygamesbr','ohmyremi','namyung','AlcoreRU','mismagpie',
            'wildez','carola','lucasgamingpl','anderzel','vanarambaion','barriiicade','Skaggson','DocFrags','julien','anthonyz','a1rm4x',
            'torusmastaz','dayzru','fortyone','relyks','hodsy','Alfouille45','2seven_','pokelawls','OGfent','bonjwa','ceee','g0tohell',
            'DottyHack','megamem3','realgzuz','beltazor','ktvsky','GmxxGoose','UndaCavaScav'];
    case 7:
        return [
            'khaleesa96','juncker_','kagaminium','hayz','moczy','hitoki','ricoy23','cpt_miilller','lvndmark','Fluck','ren0809k',
            'mastersnakou','Valarman','iitztimmy','OneMouseGaming','mrs_sarahx','tarkovtvitalia','elwycco','annemunition','legitaero',
            'kravitz7','faraday_ufficial','Soroket','mittenz','tooklutch_','m4st3rj3y','utopiagamingasd','dobbykillstreak','DestroyerProject',
            'crooklynkat','justkilo','llamav4','lifewatcher_','puhdado','megad3ath','RocketBeansTV','everyeyeit','F_I_'];
    case 8:
        return [
            'pestily', 'trentau', 'z4mmpa', 'maniacfr',
            'deadlyxpanda', 'J_Dog_th3_Wise', 'm4rtingst', 
            'knueppelpaste', 'lowaim_', '2twistedtv', 'mrxavito',
            'dextravaganza', 'dahmien7', 'sleepy_boiii', 'welfek',
            'flornce', 'Matzui', 'Parliamodivg', 'krashed', 'luki',
            'orzanel', 'dunduk', 'domontovich', 'inseq', 'honeymad',
            'DeXZoR', 'meethut', 'sacriel', 'DanExert', 'irregulardave',
            'zeriial', 'timo_redbeard', 'dangheesling', 'drlupo',
            'summit1g', 'lirik', 'kiings', 'chickenprism', 'jenntacles',
            'queenfps', 'iamtrevormay', 'JERICHO', 'velion83', 'xqcow',
            'timthetatman', 'whiskey_cat', 'tradergamerguy', 'bearki'];
    case 28:
        return [
            'pestily', 'trentau', 'z4mmpa', 'maniacfr',
            'deadlyxpanda', 'J_Dog_th3_Wise', 'm4rtingst', 
            'knueppelpaste', 'lowaim_', '2twistedtv', 'mrxavito',
            'dextravaganza', 'dahmien7', 'sleepy_boiii', 'welfek',
            'flornce', 'Matzui', 'Parliamodivg', 'krashed', 'luki',
            'orzanel', 'dunduk', 'domontovich', 'inseq', 'honeymad',
            'DeXZoR', 'meethut', 'sacriel', 'DanExert', 'irregulardave',
            'zeriial', 'timo_redbeard', 'dangheesling', 'drlupo',
            'summit1g', 'lirik', 'kiings', 'chickenprism', 'jenntacles',
            'queenfps', 'iamtrevormay', 'JERICHO', 'velion83', 'xqcow',
            'timthetatman', 'whiskey_cat', 'tradergamerguy', 'bearki'];
    case 29:
        return [
            'pestily','mrxavito','orzanel','zeriial','iamtrevormay','trentau','dextravaganza',
            'dunduk','timo_redbeard','JERICHO','z4mmpa','dahmien7','domontovich','dangheesling',
            'velion83','maniacfr','sleepy_boiii','inseq','drlupo','xqcow','deadlyxpanda','welfek',
            'honeymad','summit1g','timthetatman','J_Dog_th3_Wise','flornce','DeXZoR','lirik','whiskey_cat',
            'm4rtinqst','Matzui','meethut','kiings','tradergamerguy','knueppelpasteParliamodivg','sacriel',
            'chickenprism','bearki','lowaim_','krashed','DanExert','jenntacles','2twistedtv','luki','irregulardave','queenfps'];
    case 30:
        return [
            'BAXBEAST','menostrece','nemonas20','sequisha','zedmagic','slushpuppy','cris_rolan',
            'quattroace','bnans','bazingathatb','Dylhero','GgSanTomE','rasty_airsoft','one_shot_gurl',
            'zchum','ehhdannn','markilokurasy','svetlogor','smittystone','keebler','flambass','laeppastream',
            'asmadey','hutchmf','buttermewaffle','mouzakrobat','mick3y54','turbo_kasha','thereal_mccoy','gaxicola',
            'pentapan','PuDiick','break','sneakylol','freemasonlive','pietsmiet','chaab','madiakz','CovertGG','RagenQQ',
            'ryu163','shroud','jawshpawshtv','tachales','barbonetatuato','klean','ssuddy','aynzz','Kilnier','anthony_kongphan','BBGun'];
    case 31:
        return [
            'drinno','LonnyBTW','kr_hunt','beb8p','datatv_','morloft','srserpiente','nobaj','whyme758','DecayedDodo',
            'guigao','skumator','MoenTTV','PsiSyn','Ninja_with_no_L','gfaust','carranco','ramenstyle','ontorius','unholylucifer',
            'xander5k','CarlosDLeon','shina4','veritas','jaydreame','robustercz','skykhoqua','streamlab','willerz','michaelbenson',
            'meyer_tv','dinez','twixterria','aquafps','nixse','outc1der','tweak','theblindshogun','biggyblains','TinnXV','hummz_21',
            'Cantact','axel_tv','flamehopper','schriztopher','zeakzeric','detonator_robin','momentsoftarkov','ironfists_tv'];
    default:
        return "";
        
    }
}