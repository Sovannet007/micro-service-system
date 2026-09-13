package com.net.api_gateway.controller;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class SessionController {


    private final KeycloakAdminService service;



    @GetMapping("/sessions/{userId}")
    public Mono<List<SessionResponse>> sessions(
            @PathVariable String userId
    ){

        return service.getUserSessions(userId);

    }



    @DeleteMapping("/sessions/{sessionId}")
    public Mono<Void> logoutSession(
            @PathVariable String sessionId
    ){

        return service.logoutSession(sessionId);

    }



    @PostMapping("/logout-all/{userId}")
    public Mono<Void> logoutAll(
            @PathVariable String userId
    ){

        return service.logoutAll(userId);

    }

}
