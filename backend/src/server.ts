import fastify from "fastify"; // framework
import cors from '@fastify/cors'
import { serializerCompiler, validatorCompiler } from "fastify-type-provider-zod";
import { createTrip } from "./routes/create-trip";
import { confirmTrip } from "./routes/confirm-trip";
import { confirmParticipant } from "./routes/confirm-participant";
import { createActivily } from "./routes/create-activity";
import { getActivities } from "./routes/get-activities";
import { getLinks } from "./routes/get-links";
import { getParticipants } from "./routes/get-participants";
import { createInvite } from "./routes/create-invite";
import { updateTrip } from "./routes/update-trip";
import { getTripDetails } from "./routes/get-trip-details";
import { getParticipantDetails } from "./routes/get-participant-details";
import { errorHandler } from "./error-handler";
import { env } from "./env";

const app = fastify()

app.register(cors, {
    origin: '*',
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.setErrorHandler(errorHandler)

app.register(createTrip)
app.register(createActivily)
app.register(createInvite)

app.register(confirmTrip)
app.register(confirmParticipant)

app.register(getActivities)
app.register(getLinks)
app.register(getParticipants)
app.register(getTripDetails)
app.register(getParticipantDetails)

app.register(updateTrip)

app.listen({ port: env.PORT }).then(() => {
    console.log("server on in port 3333");
})