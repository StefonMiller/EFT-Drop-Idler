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
    delayInMinutes: 30,
    periodInMinutes: 30
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
    dateArgs = totalArgs[0].split('.')
    day = parseInt(dateArgs[0])
    month = parseInt(dateArgs[1])
    year = parseInt(dateArgs[2])
    hour = parseInt(timeArgs[0])

    if(hour < 12)
    {
        console.log("Not 12 MSK yet, keeping day from incrementing...")
        day--;
    }
    if(month == 6 && year == 2020) 
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
    case 11:
        return [
            'pestily',	'fairtx',	'mick3y54',
            'skumator',	'evrzhy',	'mratomicduck',
            'ulqi',	'dunduk',	'armuttv',
            'shina4',	'cris_rolan',	'madiakz',
            'leonnzera',	'prophet_fmj',	'skaavtv',
            'operatordrewski',	'baddie',	'welyn',
            'ohmwrecker',	'mittenz',	'DottyHack',
            'geekseh',	'professor_akimbox',	'jessekazam',
            'luki',	'thereal_mccoy',	'galleria_gm',
            'namyung',	'momentsoftarkov',	'jaketucker_'];
    case 12:
        return [ 
            'sacriel',	'aimlul',	'menostrece',
            'weekey94',	'glitzyphoenix',	'f1ashko',
            'rasty_airsoft',	'jonathantramp',	'dre3dd',
            'glorious_e',	'g0tohell',	'carranco',
            'bobek_zklobouku',	'pik_tv',	'totallyacro',
            'sequisha',	'smoke',	'sigma',
            'optimusbananas',	'likeahero',	'mad_ruski',
            'kiings',	'generalsam123',	'Pokelawls',
            'mismagpie',	'duendepablo',	'playerjp_',
            'ren0809k',	'phombie',	'dat_olen'];
    case 13:
        return [
            'ghostfreak66',	'srserpiente',	'dahmien7',
            'thiibz976',	'znorux',	'meethut',
            'quattroace',	'twixterria',	'hitoki',
            'H4nsMeis3r',	'kasyascherbakov',	'yoryi88',
            'burcay',	'anderzel',	'welfek',
            'anthony_kongphan',	'dangheesling',	'arsyntv',
            'prefireztv',	'Dylhero',	'thewatcher',
            'kusqt',	'jenntacles',	'ramenstyle',
            'sharptooth',	'mrdrakezilla',	'fps_shaka',
            'haematl',	'1n1ck',	'irregulardave'];
    case 14:
        return [
            'tweak',	'jackfrags',	'bibixhd',
            'mcgugu',	'juncker_',	'UncivilizationTV',
            'makatao',	'irokezzina',	'bakeezy',
            'lukasold',	'lifewatcher_',	'streamlab',
            'carpnplay',	'ktvsky',	'cashnalot',
            'anton',	'fortyone',	'damnitbennett',
            'likebutterlive',	'Frolicer',	'wtfmoses',
            'Gotcha',	'queenfps',	'sneakylol',
            'onepeg',	'hungoverakorn',	'sheriffeli',
            'cloakzy',	'ryzme',	'ghostthelama'];
    case 15:
        return [
            'beastqt',	'maihopawango',	'torusmastaz',
            'meyer_tv',	'rik_leah',	'PsiSyn',
            'maza4kst',	'alconafter',	'break',
            'tachales',	'beb8p',	'irina_shoroh',
            'cpt_miilller',	'fugglet',	'losiugra',
            'cohhcarnage',	'slushpuppy',	'jennajulien',
            'puhdado',	'chickenprism',	'hellsusan',
            'rowan',	'crackbabe',	'inky',
            'ironfists_tv',	'peeknduck_',	'megad3ath',
            'joshog',	'gabha999',	'barriiicade'];
    case 16:
        return [
            'cemka',	'robn_live',	'furl3x',
            'queenjilicious',	'barbonetatuato',	'claymore_plays',
            'withoutaim',	'insize',	'askara',
            'walkr6',	'dobbykillstreak',	'cucu0015',
            'damieee',	'animaleeeeeeeeee',	'fantasy1800',
            'deadlyslob',	'breakinskullz',	'grimmmz',
            'destinysin666',	'swagger',	'DonutOperator',
            'thebeastdm_tv',	'nickbunyun',	'a1rm4x',
            'cazzler',	'bobbiemcfly',	'frost_',
            'Albralelie',	'Adultindyz',	'resttpowered'];
    case 17:
        return [
            'hc_dizee',	'mrbboy45',	'skykhoqua',
            'iredseven',	'sherpahub',	'krashed',
            'dayzru',	'hypergl',	'ewanhc',
            'axel_tv',	'ussralexeybatya',	'abraxsus1983',
            'deegoeslive',	'kagaminium',	'ryu163',
            'klean',	'markstrom',	'aquafps',
            'CrossFireX',	'ellohime',	'vitaswiftqc',
            'morloft',	'gingerliness',	'guigao',
            'deadlyxpanda',	'iggyow',	'tsm_viss',
            'actionjaxon',	'viperdemon',	'z4mmpa'];
    case 18:
        return [
            'moondye7',	'hayz',	'vinylblade',
            'mouzakrobat',	'enerfunk',	'patosh',
            'domontovich',	'wbexp',	'DanExert',
            'sharap',	'bullseye',	'derb_herb',
            'icelaptop',	'lanvirion',	'robustercz',
            'kotton',	'veritas',	'RedVoxGaming',
            'flamehopper',	'ehhdannn',	'halifax',
            'redopz',	'moczy',	'aethos',
            'CovertGG',	'datatv_',	'icelandicgamergirl',
            'benvanlier',	'iammhuay',	'mrfalll'];
    case 19:
        return [
            'as2pik',	'bonjwa',	'agent',
            'whiteydude',	'kriszhadvice',	'theblindshogun',
            'sheriff_live',	'shnumi',	'sneakyru007',
            'Peebro',	'2seven_',	'hummz_21',
            'Matzui',	'larsen',	'o_smurf_o',
            'lvndmark',	'willerz',	'summit1g',
            'worrun_',	'one_shot_gurl',	'trailmixx_',
            'maniacfr',	'eazyshot7',	'nofoodaftermidnight',
            'party__pineapple',	'senseiscav',	'bnans',
            'epicnpcman',	'dejavushothd',	'vox_e'];
    case 20:
        return[
            'honeymad',	'mastersnakou',	'knueppelpaste',
            'realgzuz',	'wackyjacky101',	'svetlogor',
            'c_a_k_e',	'elwycco',	'drinno',
            'mr_holodos',	'asmadey',	'tsm_aimpr',
            'pentapan',	'm4rtinqst',	'mrxavito',
            'drlupo',	'lirik',	'DrDisrespect',
            'Ph0bes',	'jeremiahfraites',	'maplesyrupjunkie',
            'train__',	'silentsentry',	'mightygaming',
            'thedevildoggamer',	'jawshpawshtv',	'timthetatman',
            'pietsmiet',	'Boyminoru',	'alanzoka'];
    case 21:
        return [
            'pestily',	'fairtx',	'mick3y54',
            'skumator',	'evrzhy',	'mratomicduck',
            'ulqi',	'dunduk',	'armuttv',
            'shina4',	'cris_rolan',	'madiakz',
            'leonnzera',	'prophet_fmj',	'skaavtv',
            'operatordrewski',	'baddie',	'welyn',
            'ohmwrecker',	'mittenz',	'DottyHack',
            'geekseh',	'professor_akimbox',	'jessekazam',
            'luki',	'thereal_mccoy',	'galleria_gm',
            'namyung',	'momentsoftarkov',	'jaketucker_'];
    case 22:
        return [
            'pestily',	'fairtx',	'mick3y54',
            'skumator',	'evrzhy',	'mratomicduck',
            'ulqi',	'dunduk',	'armuttv',
            'shina4',	'cris_rolan',	'madiakz',
            'leonnzera',	'prophet_fmj',	'skaavtv',
            'operatordrewski',	'baddie',	'welyn',
            'ohmwrecker',	'mittenz',	'DottyHack',
            'geekseh',	'professor_akimbox',	'jessekazam',
            'luki',	'thereal_mccoy',	'galleria_gm',
            'namyung',	'momentsoftarkov',	'jaketucker_'];
    default:
        return "";
        
    }
}