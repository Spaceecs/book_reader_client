import {Text, View, StyleSheet} from "react-native";

export function BookCard({book}) {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>{book.title}</Text>
            <Text style={styles.subtitle}>{book.format}</Text>
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
    subtitle: {

    }
})