import {Text, View, StyleSheet, Image} from "react-native";
import {useEffect} from "react";

export function BookCard({book}) {
    useEffect(() => {
        console.log(book);
    }, []);

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.subtitle}>{book.format}</Text>
            <Image style={styles.image} source={{ uri: book.imageUrl }} />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: 200,
        height: 400,
        borderColor: "black",
        borderWidth: 2,
        color: "#000"
    },
    title: {
        textAlign: "center",
        fontSize: 20,
    },
    image: {
        width: 200,
        height: 200,
    }
})