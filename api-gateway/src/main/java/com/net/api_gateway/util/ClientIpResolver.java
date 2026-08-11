package com.net.api_gateway.util;

import org.springframework.stereotype.Component;
import org.springframework.web.server.ServerWebExchange;

@Component
public class ClientIpResolver {

    public String resolve(ServerWebExchange exchange) {
        var address = exchange.getRequest().getRemoteAddress();

        if (address == null || address.getAddress() == null) {
            return "unknown";
        }

        return address.getAddress().getHostAddress();
    }
}