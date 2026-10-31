# TruXpert Spring Migration — Phase P4 Review Report

## 1. Review Summary

- **Repository**: `TRUXPERT`
- **Branch**: `chore/stack-spring`
- **Baseline Commit**: `1369e24387785132208506b67b5994f386797859`
- **Current Head**: `f965dd810310cd3bb248cc0386d1152fd60fab8b`
- **Target Version**: Spring Boot 4.1.2 on Java 17 (Stage C1)

All changes on this branch (`git diff $(cat ../baseline/sha)`) were inspected line by line against `SPEC.md` requirements, hard rules, Section 3 traps, and non-gateable runtime behaviours.

---

## 2. Line-by-Line Spec & Trap Verification

### SPEC.md Section 1: Target Versions
| Requirement | Target | Actual | Compliant |
|---|---|---|---|
| Spring Boot Parent | `4.1.2` (`spring-boot-starter-parent`) | `4.1.2` | YES |
| Java (Stage C1) | `java.version` stays `17` | `17` | YES |
| Native Builder Image (C1) | `ghcr.io/graalvm/native-image-community:25` | `ghcr.io/graalvm/native-image-community:25` in `Dockerfile.native` | YES |
| Lombok | Boot-managed (no explicit `<version>` pin) | No `<version>` tag in dependency or annotation-processor | YES |
| springdoc (TRUXPERT) | Latest 3.0.x on Maven Central | `3.0.3` (`springdoc-openapi-starter-webmvc-ui`) | YES |

### SPEC.md Section 2: Hard Rules
1. **Work inside `repo/`**: Only `springapp/**` and `docs/nightrun/**` modified. G7 scope check passes cleanly.
2. **Databases**: Gate MySQL (`truxpert_spring_gate`, `truxpert_spring_test`) on port 33310 used exclusively. No AWS / instance metadata access.
3. **Immutability of contracts**:
   - `ddl-auto`: Retained as `${DDL_AUTO:update}`.
   - Entity mappings: All 10 entity models (`Application`, `Brand`, `Document`, `FoodTruck`, `FoodTruckVendor`, `Inspection`, `MenuItem`, `Review`, `User`, `Vendor`) have identical column names, types, lengths, nullability, relations, and table names.
   - Endpoint paths & HTTP methods: All 21 endpoints remain byte- and route-compatible.
   - Response JSON shapes: All key shapes verified identical across all endpoints.
   - Status codes: All HTTP statuses match baseline (200, 201, 400, 404).
   - Security & CORS: Unchanged.
   - `application.properties`: No renamed keys or altered configuration values.
4. **No prohibited git commands**: No `git commit`, `reset`, `checkout`, `stash`, `clean`, `rebase`, `push` performed.
5. **Preserve tests**: All 21 unit/integration tests in `SpringappApplicationTests.java` are intact and active (zero tests deleted, weakened, skipped, or `@Disabled`).
6. **Minimal new dependencies**: Only `spring-boot-starter-webmvc-test` added in `<scope>test</scope>` to provide `@AutoConfigureMockMvc` under Boot 4 modular structure.
7. **Secrets safety**: No secrets leaked, printed, or copied.
8. **Gate execution**: Verified passing `spring-gate.sh current` (G1 + G7 + V).

### SPEC.md Section 3: Spring Stage C1 Traps
- **Modular starters**: `spring-boot-starter-web` replaced with `spring-boot-starter-webmvc`. `spring-boot-starter-webmvc-test` added for test slice autoconfiguration.
- **Jackson 3**: Jackson annotations in entities (`@JsonIgnoreProperties`, `@JsonBackReference`, `@JsonGetter`, `@JsonManagedReference`) originate from `com.fasterxml.jackson.annotation` and operate identically. No deprecated `Jackson2ObjectMapperBuilder` or Jackson 2 databind imports present.
- **Spring Framework 7 / Testing**: No `@MockBean` or `@SpyBean` used. No `HttpHeaders` as `MultiValueMap` calls. Test import for `@AutoConfigureMockMvc` moved to `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc`.
- **Spring Security 7**: Security configuration is commented out in this service; spring-security is not on the classpath.
- **Hibernate 7**: Removed deprecated dialect `MySQL8Dialect` from `application-example.properties`. Zero schema drift (94 schema elements identical).
- **Renamed properties**: Validated using `spring-boot-properties-migrator`; zero deprecated or renamed properties reported. Migrator dependency confirmed removed before phase completion.
- **Native image**: `springapp/Dockerfile.native` updated to `ghcr.io/graalvm/native-image-community:25`. AOT processing (`-Pnative -DskipTests -DskipNativeBuild=true package`) succeeds with exit code 0.
- **Lombok**: No version pins present.
- **springdoc**: Upgraded to 3.0.3; OpenAPI and Swagger UI endpoints remain active.

---

## 3. Non-Gateable Behaviour Checks

| Area | Status | Verification Detail |
|---|---|---|
| **Authenticated endpoints** | Verified | SecurityConfig is disabled; all endpoints remain accessible per design. |
| **Write paths** | Verified | All write operations (`/addVendor`, `/apply`, `/updateVendor/{id}`, `/deleteVendor/{id}`, `/api/applications/**`) maintain exact request payload types and response codes. |
| **Scheduled jobs** | N/A | No `@Scheduled` or `@EnableScheduling` present. |
| **WebSocket / SockJS** | N/A | No WebSocket or SockJS infrastructure present. |
| **CORS configuration** | Verified | `CorsConfiguration.java` configures `addCorsMappings("/**")` with matching methods and origins. |
| **Exception handlers** | Verified | `GlobalExceptionHandler.java` maps `InvalidOperatingRegionException`, `Duplicate*`, `UserNotFoundException` -> 400 Bad Request, `RuntimeException` -> 404 Not Found. |
| **Date & number formats** | Verified | `LocalDateTime` serializes to ISO-8601 strings, matching baseline shape. |
| **Lazy loading** | Verified | `spring.jpa.properties.hibernate.enable_lazy_load_no_trans=true` retained. EAGER relationships preserved across entities. |

---

## 4. Findings & Fix Status

| ID | Severity | File:Line | Description | Status |
|---|---|---|---|---|
| F-01 | Minor | `springapp/src/main/resources/application-example.properties:17` | Deprecated `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQL8Dialect` | **Fixed** (Removed per SPEC Section 3) |
| F-02 | Minor | `springapp/src/test/java/com/examly/springapp/SpringappApplicationTests.java:7` | `@AutoConfigureMockMvc` import moved under Boot 4 modular webmvc starter | **Fixed** (Updated to `org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc`) |
| F-03 | Minor | `springapp/pom.xml:37` | `springdoc-openapi-starter-webmvc-ui` version 2.7.0 incompatible with Boot 4 | **Fixed** (Updated to 3.0.3 per SPEC Section 1 & 3) |
| F-04 | Minor | `springapp/Dockerfile.native:15` | Native builder image pinned to GraalVM 17 | **Fixed** (Updated to `ghcr.io/graalvm/native-image-community:25`) |
| F-05 | Info | `springapp/pom.xml` | Verification with `spring-boot-properties-migrator` | **Fixed** (Ran migration check; 0 renamed keys found; dependency removed) |
| F-06 | Blocker | `~/apps-gates/runtime.py:208` | Python SyntaxError: unterminated f-string literal prevents running `spring-gate.sh run17` | **Not Fixed** (External harness file outside `repo/`; prohibited from editing by SPEC Hard Rule 1) |
| F-07 | Medium | `springapp/pom.xml:30` | Java 25 (Stage C2) skipped in P3 due to P2 harness failure | **Not Fixed** (Blocked on P2 gate harness fix; deferred to owner) |

---

## 5. Gate Execution Verification

- `bash ~/apps-gates/spring-gate.sh current`:
  - JDK: OpenJDK 17 (`/usr/lib/jvm/java-17-openjdk-arm64`)
  - Version assertion (V): PASS
  - Scope assertion (G7): PASS
  - Build & Tests (G1): PASS (`21/21` tests passing)
  - Exit code: 0
