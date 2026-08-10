package com.net.api_gateway.monitoring;

import io.micrometer.core.instrument.Counter;
import io.micrometer.core.instrument.MeterRegistry;
import org.springframework.stereotype.Component;

@Component
public class GatewayMetrics {

    private final Counter routeGetAll;
    private final Counter routeCreate;
    private final Counter routeCreateError;
    private final Counter routeUpdate;
    private final Counter routeDelete;

    public GatewayMetrics(MeterRegistry registry) {
        this.routeGetAll = Counter.builder("gateway.route.get_all")
                .description("Number of get all route operations")
                .register(registry);

        this.routeCreate = Counter.builder("gateway.route.create")
                .description("Number of created gateway routes")
                .register(registry);

        this.routeCreateError = Counter.builder("gateway.route.create.error")
                .description("Number of failed gateway route creations")
                .register(registry);

        this.routeUpdate = Counter.builder("gateway.route.update")
                .description("Number of updated gateway routes")
                .register(registry);

        this.routeDelete = Counter.builder("gateway.route.delete")
                .description("Number of deleted gateway routes")
                .register(registry);
    }

    public void incrementGetAll() {
        routeGetAll.increment();
    }

    public void incrementCreate() {
        routeCreate.increment();
    }

    public void incrementCreateError() {
        routeCreateError.increment();
    }

    public void incrementUpdate() {
        routeUpdate.increment();
    }

    public void incrementDelete() {
        routeDelete.increment();
    }
}