
  export namespace Schemas {
    // <Schemas>
  export type CreateNoteRequest = {
  /**
   * Note text; must contain at least one non-whitespace character.
   */
  content: string;
}
export type Note = { id: number, content: string, createdAt: string }
export type ApiError = {
  /**
   * Machine-readable error code
   */
  code: string;
  /**
   * Human-readable error message
   */
  message: string;
}

    // </Schemas>
    }
  
  export namespace Endpoints {
  // <Endpoints>
  
  export type get_ListNotes = {
      method: "GET",
      path: "/api/notes",
      requestFormat: "json",
      responseFormat: "json",
      parameters: never,
      responses: {200: Array<Schemas.Note>,
},
      
    }
export type post_CreateNote = {
      method: "POST",
      path: "/api/notes",
      requestFormat: "json",
      responseFormat: "json",
      parameters: {
            
        
        
        
        body:  Schemas.CreateNoteRequest,
          }
      responses: {201: Schemas.Note,
400: Schemas.ApiError,
},
      
    }
export type delete_DeleteNote = {
      method: "DELETE",
      path: "/api/notes/{id}",
      requestFormat: "json",
      responseFormat: "json",
      parameters: {
            
        path:  { id: number },
        
        
        
          }
      responses: {204: unknown,
404: Schemas.ApiError,
},
      
    }

  // </Endpoints>
  }
  
  
     // <EndpointByMethod>
     export type EndpointByMethod = {
     get: {
           "/api/notes": Endpoints.get_ListNotes
         },
post: {
           "/api/notes": Endpoints.post_CreateNote
         },
delete: {
           "/api/notes/{id}": Endpoints.delete_DeleteNote
         }
     }
     
     // </EndpointByMethod>
     

    // <EndpointByMethod.Shorthands>
    export type GetEndpoints = EndpointByMethod["get"]
export type PostEndpoints = EndpointByMethod["post"]
export type DeleteEndpoints = EndpointByMethod["delete"]
    // </EndpointByMethod.Shorthands>
    