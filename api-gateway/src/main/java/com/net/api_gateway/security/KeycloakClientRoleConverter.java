package com.net.api_gateway.security;

import org.springframework.core.convert.converter.Converter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Flux;

import java.util.Collection;
import java.util.Map;

@Component
public class KeycloakClientRoleConverter
        implements Converter<Jwt, Flux<GrantedAuthority>> {

    private static final String CLIENT_ID =
            "api-gateway-management";

    @Override
    public Flux<GrantedAuthority> convert(Jwt jwt) {

        Map<String, Object> resourceAccess =
                jwt.getClaim("resource_access");

        if (resourceAccess == null) {
            return Flux.empty();
        }

        Object clientValue =
                resourceAccess.get(CLIENT_ID);

        if (!(clientValue instanceof Map<?, ?> clientAccess)) {
            return Flux.empty();
        }

        Object rolesValue =
                clientAccess.get("roles");

        if (!(rolesValue instanceof Collection<?> roles)) {
            return Flux.empty();
        }

        return Flux
                .fromIterable(roles)
                .map(Object::toString)
                .map(role ->
                        (GrantedAuthority)
                                new SimpleGrantedAuthority(
                                        "ROLE_" + role
                                )
                );
    }
}