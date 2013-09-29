/**
 * Author: petar
 * Date: 9/29/13
 */

/**
 * @method getClientIp
 *
 * Get client IP address
 * http://catapulty.tumblr.com/post/8303749793/heroku-and-node-js-how-to-get-the-client-ip-address
 *
 * This doesn't use ip2location, just a helper to get ip to run through ip2location if user doesn't provide cc
 * Will return 127.0.0.1 when testing locally
 *
 * @param req
 * @returns {string} ip
 */
function getClientIp(req) {
    var ipAddress;
    // Amazon EC2 / Heroku workaround to get real client IP
    var forwardedIpsStr = req.header('X-Forwarded-For'),
        clientIp = req.header('X-Client-IP');

    if (clientIp) {
        ipAdress = clientIp;
    }
    else if (forwardedIpsStr) {
        // 'x-forwarded-for' header may return multiple IP addresses in
        // the format: "client IP, proxy 1 IP, proxy 2 IP" so take the
        // the first one
        var forwardedIps = forwardedIpsStr.split(',');
        ipAddress = forwardedIps[0];
    }
    if (!ipAddress) {
        // Ensure getting client IP address still works in
        // development environment
        ipAddress = req.connection.remoteAddress;
    }
    console.log(ipAddress);
    return ipAddress;
}

/**
* Expose mode public functions
*/
exports.getClientIp = getClientIp;