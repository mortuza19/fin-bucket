import { User as FirebaseUser } from "firebase/auth";

import { createUserProfileIfNotExists } from "@/lib/firestore/users";

export async function createUser(user: FirebaseUser): Promise<void> {
    try {
        await createUserProfileIfNotExists(user);
    } catch (err) {
        console.error("Error creating user profile", err);
        throw new Error("Failed to create user profile");
    }
}