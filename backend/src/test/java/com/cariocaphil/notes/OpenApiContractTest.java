package com.cariocaphil.notes;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.Operation;
import io.swagger.v3.oas.models.PathItem;
import io.swagger.v3.parser.OpenAPIV3Parser;
import io.swagger.v3.parser.core.models.SwaggerParseResult;
import org.junit.jupiter.api.Test;

import java.nio.file.Path;
import java.util.HashSet;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertTrue;

class OpenApiContractTest {

    @Test
    void openApiContractIsValidAndContainsExpectedOperations() {
        Path contractPath = Path.of("..", "contracts", "openapi.yaml").toAbsolutePath().normalize();
        SwaggerParseResult result = new OpenAPIV3Parser().readLocation(contractPath.toString(), null, null);

        OpenAPI openAPI = result.getOpenAPI();
        assertNotNull(openAPI, "Parsed OpenAPI document must not be null");
        assertTrue(result.getMessages() == null || result.getMessages().isEmpty(),
                () -> "Unexpected parser messages: " + result.getMessages());

        Set<String> operationIds = new HashSet<>();
        if (openAPI.getPaths() != null) {
            for (PathItem pathItem : openAPI.getPaths().values()) {
                collectOperationId(operationIds, pathItem.getGet());
                collectOperationId(operationIds, pathItem.getPost());
                collectOperationId(operationIds, pathItem.getPut());
                collectOperationId(operationIds, pathItem.getDelete());
                collectOperationId(operationIds, pathItem.getPatch());
            }
        }

        assertTrue(operationIds.contains("listNotes"), "Missing operationId listNotes");
        assertTrue(operationIds.contains("createNote"), "Missing operationId createNote");
        assertTrue(operationIds.contains("deleteNote"), "Missing operationId deleteNote");
        assertEquals(3, operationIds.size(), "Expected exactly three operations");
    }

    private static void collectOperationId(Set<String> operationIds, Operation operation) {
        if (operation != null && operation.getOperationId() != null) {
            operationIds.add(operation.getOperationId());
        }
    }
}
