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


    @Override
    public Flux<GrantedAuthority> convert(Jwt jwt) {


        Map<String, Object> realmAccess =
                jwt.getClaim("realm_access");


        if (realmAccess == null) {
            return Flux.empty();
        }


        Object rolesValue =
                realmAccess.get("roles");


        if (!(rolesValue instanceof Collection<?> roles)) {
            return Flux.empty();
        }


        return Flux.fromIterable(roles)
                .map(Object::toString)
                .map(role ->
                        new SimpleGrantedAuthority(
                                "ROLE_" + role
                        )
                );
    }
}