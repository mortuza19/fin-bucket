import { User as FirebaseUser } from "firebase/auth";

import { createUserProfileIfNotExists } from "@/lib/firestore/users";
import { UserProfile } from "@/types/models";

export async function createUser(user: FirebaseUser): Promise<UserProfile | null> {
    try {
        return createUserProfileIfNotExists(user);
    } catch (err) {
        console.error("Error creating user profile", err);
        throw new Error("Failed to create user profile");
    }
}