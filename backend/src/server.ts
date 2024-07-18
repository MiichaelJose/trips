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

const app = fastify()

app.register(cors, {
    origin: '*',
})

app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

app.register(createTrip)
app.register(createActivily)
app.register(createInvite)

app.register(confirmTrip)
app.register(confirmParticipant)

app.register(getActivities)
app.register(getLinks)
app.register(getParticipants)

app.register(updateTrip)

app.listen({ port: 3333 }).then(() => {
    console.log("server on in port 3333");
})