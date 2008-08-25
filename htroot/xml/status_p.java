// /xml.queues/status_p.java
// -------------------------------
// part of the yacy
//
// (C) 2006 Alexander Schier
// last major change: 03.11.2006
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software Foundation, Inc., 
// 51 Franklin Street, Fifth Floor, Boston, MA 02110-1301 USA.

package xml;

import de.anomic.http.httpRequestHeader;
import de.anomic.http.httpdByteCountInputStream;
import de.anomic.http.httpdByteCountOutputStream;
import de.anomic.plasma.plasmaSwitchboard;
import de.anomic.plasma.plasmaSwitchboardConstants;
import de.anomic.server.serverMemory;
import de.anomic.server.serverObjects;
import de.anomic.server.serverProcessor;
import de.anomic.server.serverSwitch;

public class status_p {
    
    
    public static serverObjects respond(final httpRequestHeader header, final serverObjects post, final serverSwitch<?> env) {
        // return variable that accumulates replacements
        final plasmaSwitchboard sb = (plasmaSwitchboard) env;
        final serverObjects prop = new serverObjects();
        if (post == null || !post.containsKey("html"))
            prop.setLocalized(false);
        prop.put("rejected", "0");
        sb.updateMySeed();
        final int  cacheOutSize = sb.webIndex.dhtOutCacheSize();
        final long cacheMaxSize = sb.getConfigLong(plasmaSwitchboardConstants.WORDCACHE_MAX_COUNT, 10000);
        prop.putNum("ppm", sb.currentPPM());
        prop.putNum("qpm", sb.webIndex.seedDB.mySeed().getQPM());
        prop.putNum("wordCacheSize", sb.webIndex.dhtOutCacheSize() + sb.webIndex.dhtInCacheSize());
        prop.putNum("wordCacheWSize", cacheOutSize);
        prop.putNum("wordCacheKSize", sb.webIndex.dhtInCacheSize());
        prop.putNum("wordCacheMaxSize", cacheMaxSize);
        prop.put("wordCacheWCount", cacheOutSize);
        prop.put("wordCacheMaxCount", cacheMaxSize);

		//
		// memory usage and system attributes
        prop.putNum("freeMemory", serverMemory.free());
        prop.putNum("totalMemory", serverMemory.total());
        prop.putNum("maxMemory", serverMemory.max());
        prop.putNum("processors", serverProcessor.availableCPU);

		// proxy traffic
		prop.put("trafficIn", httpdByteCountInputStream.getGlobalCount());
		prop.put("trafficProxy", httpdByteCountOutputStream.getAccountCount("PROXY"));
		prop.put("trafficCrawler", httpdByteCountInputStream.getAccountCount("CRAWLER"));

        // return rewrite properties
        return prop;
    }
    
}
