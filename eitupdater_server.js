var Epg  = require('./lib/epg')
,   conf = require('./conf')
,   epg  = new Epg(conf.epg)
,   moment = require('moment')
,   status   = require("./status_client")('eitUpdate')
;

var interval = conf.eit_updater.interval_hours * (60 * 60 * 1000);

var update = function() {
    status.getStatus(function(st) {
        if (st.importer.status === 'running') {
            status.set('status', 'waiting lock');
            setTimeout(update, 500);
        } else {
            status.set('status', 'running');
            var ret = epg.updateEit();
            console.log("Eit updated!");
            if (ret) {
                epg.updateCarousel();
                console.log("Carousel updated!");
            }
            status.set('status', 'idle');
            status.set('lastRun', moment().toISOString());
            status.set('nextRun', moment().add(interval, 'ms').toISOString());
        }
    });
};
status.set('status', 'running', function() {
    console.log("Updating Eit");
    update();
    setInterval(update, interval);
});
